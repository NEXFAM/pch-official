import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getSession } from '@/lib/session'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.is_admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const db = await getDb()
    const users = db
      .prepare(
        `SELECT id, full_name, email, is_winner, winner_at, payment_submitted, created_at
         FROM users ORDER BY created_at DESC`
      )
      .all()
    return NextResponse.json({ users })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
