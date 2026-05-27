import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

export async function POST(request) {
  try {
    const { password } = await request.json()
    if (!password) return NextResponse.json({ error: 'Password required' }, { status: 400 })
    if (password !== process.env.ADMIN_PASSWORD)
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })

    const session = await getSession()
    session.is_admin = true
    await session.save()
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
