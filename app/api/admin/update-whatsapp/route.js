import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function POST(request) {
  try {
    const session = await getSession()
    if (!session?.is_admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { number } = await request.json()
    if (!number || !/^\d+$/.test(number))
      return NextResponse.json({ error: 'Digits only, with country code' }, { status: 400 })

    const db = await getDb()
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
    const existing = db.prepare("SELECT id FROM settings WHERE key = 'whatsapp_number'").get()
    if (existing) {
      db.prepare(`UPDATE settings SET value = ?, updated_at = ? WHERE key = 'whatsapp_number'`).run(number, now)
    } else {
      db.prepare(`INSERT INTO settings (key, value, updated_at) VALUES ('whatsapp_number', ?, ?)`).run(number, now)
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
