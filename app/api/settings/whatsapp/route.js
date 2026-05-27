import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const db = await getDb()
    const row = db.prepare("SELECT value FROM settings WHERE key = 'whatsapp_number'").get()
    return NextResponse.json({ number: row?.value || '1234567890' })
  } catch {
    return NextResponse.json({ number: '1234567890' })
  }
}
