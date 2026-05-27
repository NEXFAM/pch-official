import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getDb } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function POST(request) {
  try {
    const { email, password } = await request.json()
    if (!email || !password)
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })

    const db = await getDb()
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase())
    if (!user || !(await bcrypt.compare(password, user.password_hash)))
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })

    const session = await getSession()
    session.id = user.id
    session.email = user.email
    session.full_name = user.full_name
    session.is_admin = false
    await session.save()

    return NextResponse.json({ success: true, user: { id: user.id, full_name: user.full_name, email: user.email } })
  } catch (err) {
    console.error('login:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
