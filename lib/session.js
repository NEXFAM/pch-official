import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'

export const sessionOptions = {
  password:
    process.env.SESSION_SECRET ||
    'development_fallback_secret_key_min_32_chars_not_for_prod!!',
  cookieName: 'pch_official_session',
  ttl: 60 * 60 * 24 * 7,
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
  },
}

export async function getSession() {
  return await getIronSession(cookies(), sessionOptions)
}
