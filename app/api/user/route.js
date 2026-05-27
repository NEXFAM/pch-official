import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getSession } from '@/lib/session'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.id) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const db = await getDb()
    const user = db
      .prepare(
        `SELECT id, full_name, email, is_winner, winner_at,
                payment_submitted, payment_submitted_at, created_at
         FROM users WHERE id = ?`
      )
      .get(session.id)

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    return NextResponse.json({ user })
  } catch (err) {
    console.error('get user:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
