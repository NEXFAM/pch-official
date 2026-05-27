import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const db = await getDb()
    const notifications = db
      .prepare('SELECT * FROM winner_notifications ORDER BY won_at DESC LIMIT 10')
      .all()
    return NextResponse.json({ notifications })
  } catch (err) {
    console.error('notifications:', err)
    return NextResponse.json({ notifications: [] })
  }
}
