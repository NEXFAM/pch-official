import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getDb } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function POST(request) {
  try {
    const { full_name, email, password } = await request.json()

    if (!full_name?.trim() || !email || !password)
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    if (password.length < 6)
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })

    const db = await getDb()
    if (db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase()))
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })

    const password_hash = await bcrypt.hash(password, 10)
    const { lastInsertRowid: id } = db
      .prepare('INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)')
      .run(full_name.trim(), email.toLowerCase(), password_hash)

    const session = await getSession()
    session.id = Number(id)
    session.email = email.toLowerCase()
    session.full_name = full_name.trim()
    session.is_admin = false
    await session.save()

    return NextResponse.json({ success: true, user: { id, full_name, email } })
  } catch (err) {
    console.error('signup:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
