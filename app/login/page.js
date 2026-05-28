'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', ...form }),
      })
      const d = await res.json()
      if (!res.ok) setError(d.error || 'Login failed')
      else { router.push('/dashboard'); router.refresh() }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ backgroundColor: '#f8fafc' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <span className="text-4xl font-black" style={{ color: '#FFD700' }}>PCH</span>
            <span className="text-4xl font-black" style={{ color: '#0f172a' }}> Official</span>
          </Link>
          <p className="text-gray-500 mt-2 text-sm">Sign in to check your giveaway status</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border-t-4" style={{ borderTopColor: '#FFD700' }}>
          <h1 className="text-2xl font-black mb-6" style={{ color: '#0f172a' }}>Welcome Back</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: '#0f172a' }}>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none"
                style={{ borderColor: '#FFD700' }}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: '#0f172a' }}>Password</label>
              <input
                type="password"
                value={form.password}
                onChange={set('password')}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none"
                style={{ borderColor: '#FFD700' }}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-black text-lg transition-colors"
              style={{ backgroundColor: loading ? '#FFC107' : '#FFD700', color: '#0f172a' }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-500">
            New user?{' '}
            <Link href="/signup" className="font-bold hover:underline" style={{ color: '#0f172a' }}>
              Enter the Giveaway Free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
