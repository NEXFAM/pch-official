'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Navbar({ user }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function logout() {
    setBusy(true)
    await fetch('/api/db', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'logout' }) })
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="bg-white border-b-2 shadow-sm" style={{ borderColor: '#FFD700' }}>
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1">
          <span className="text-2xl font-black" style={{ color: '#FFD700' }}>PCH</span>
          <span className="text-2xl font-black" style={{ color: '#0f172a' }}>Official</span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="hidden sm:block text-sm text-gray-500">
                Welcome, <strong style={{ color: '#0f172a' }}>{user.full_name}</strong>
              </span>
              <Link
                href="/dashboard"
                className="text-sm font-semibold hover:underline"
                style={{ color: '#0f172a' }}
              >
                Dashboard
              </Link>
              <button
                onClick={logout}
                disabled={busy}
                className="text-sm font-bold px-4 py-2 rounded-lg transition-colors"
                style={{ backgroundColor: '#FFD700', color: '#0f172a' }}
              >
                {busy ? 'Logging out…' : 'Logout'}
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-semibold hover:underline" style={{ color: '#0f172a' }}>
                Login
              </Link>
              <Link
                href="/signup"
                className="text-sm font-bold px-4 py-2 rounded-lg transition-colors"
                style={{ backgroundColor: '#FFD700', color: '#0f172a' }}
              >
                Enter Giveaway
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
