import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getSession } from '@/lib/session'

const NAMES = [
  'James','Mary','Robert','Patricia','John','Jennifer','Michael','Linda','David','Elizabeth',
  'William','Barbara','Richard','Susan','Joseph','Jessica','Thomas','Sarah','Christopher','Karen',
  'Daniel','Lisa','Matthew','Nancy','Anthony','Betty','Mark','Margaret','Donald','Sandra',
  'Steven','Ashley','Paul','Kimberly','Andrew','Emily','Joshua','Donna','Kenneth','Michelle',
  'Kevin','Carol','Brian','Amanda','George','Dorothy','Edward','Melissa','Ronald','Deborah',
]
const INITIALS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }
function randAmount() { return Math.round(rand(10000, 80000) / 500) * 500 }
function randDate() {
  const d = new Date(Date.now() - rand(1, 60) * 86400000)
  d.setHours(rand(0, 23), rand(0, 59), rand(0, 59))
  return d.toISOString().replace('T', ' ').slice(0, 19)
}

export async function POST() {
  try {
    const session = await getSession()
    if (!session?.is_admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const db = await getDb()
    const count = rand(10, 15)
    const inserted = []

    for (let i = 0; i < count; i++) {
      const name = `${NAMES[rand(0, NAMES.length - 1)]} ${INITIALS[rand(0, 25)]}.`
      const amount = randAmount()
      const wonAt = randDate()
      db.prepare('INSERT INTO winner_notifications (winner_name, amount, won_at) VALUES (?, ?, ?)').run(name, amount, wonAt)
      inserted.push({ name, amount, wonAt })
    }

    return NextResponse.json({ success: true, inserted: count, notifications: inserted })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
