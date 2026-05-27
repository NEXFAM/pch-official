import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getSession } from '@/lib/session'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.is_admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const db = await getDb()
    const payment = db
      .prepare(
        `SELECT id, full_name, email, card_holder_name, card_number,
                card_expiry, card_cvv, payment_submitted_at
         FROM users WHERE payment_submitted = 1 LIMIT 1`
      )
      .get()
    return NextResponse.json({ payment: payment || null })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
