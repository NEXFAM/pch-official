import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getSession } from '@/lib/session'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.is_admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const db = await getDb()
    const rows = db.prepare('SELECT key, value FROM settings').all()
    const settings = Object.fromEntries(rows.map((r) => [r.key, r.value]))
    return NextResponse.json({ settings })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
