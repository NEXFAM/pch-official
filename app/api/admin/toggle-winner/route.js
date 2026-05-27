import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function POST(request) {
  try {
    const session = await getSession()
    if (!session?.is_admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { userId } = await request.json()
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    const db = await getDb()
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId)
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const clearPayment = `card_holder_name = NULL, card_number = NULL, card_expiry = NULL,
                         card_cvv = NULL, payment_submitted = 0, payment_submitted_at = NULL`

    if (user.is_winner) {
      db.prepare(`UPDATE users SET is_winner = 0, winner_at = NULL, ${clearPayment} WHERE id = ?`).run(userId)
      return NextResponse.json({ success: true, action: 'unmarked' })
    }

    const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
    db.prepare(`UPDATE users SET is_winner = 0, winner_at = NULL, ${clearPayment} WHERE is_winner = 1`).run()
    db.prepare(`UPDATE users SET is_winner = 1, winner_at = ? WHERE id = ?`).run(now, userId)
    return NextResponse.json({ success: true, action: 'marked' })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
