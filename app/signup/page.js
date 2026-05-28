'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiFetch } from '@/lib/apiFetch'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))

  function validate() {
    if (!form.full_name.trim()) return 'Full name is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Please enter a valid email'
    if (form.password.length < 6) return 'Password must be at least 6 characters'
    if (form.password !== form.confirm) return 'Passwords do not match'
    return null
  }

  async function submit(e) {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    setError('')
    setLoading(true)
    try {
      const d = await apiFetch('signup', { full_name: form.full_name, email: form.email, password: form.password })
      if (d.error) setError(d.error)
      else { router.push('/dashboard'); router.refresh() }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { label: 'Full Name', key: 'full_name', type: 'text', ph: 'John Smith' },
    { label: 'Email Address', key: 'email', type: 'email', ph: 'you@example.com' },
    { label: 'Password', key: 'password', type: 'password', ph: '••••••••' },
    { label: 'Confirm Password', key: 'confirm', type: 'password', ph: '••••••••' },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ backgroundColor: '#f8fafc' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <span className="text-4xl font-black" style={{ color: '#FFD700' }}>PCH</span>
            <span className="text-4xl font-black" style={{ color: '#0f172a' }}> Official</span>
          </Link>
          <p className="text-gray-500 mt-2 text-sm">Create your free account to enter</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border-t-4" style={{ borderTopColor: '#FFD700' }}>
          <h1 className="text-2xl font-black mb-6" style={{ color: '#0f172a' }}>Enter the Giveaway</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>
          )}

          <form onSubmit={submit} className="space-y-4">
            {fields.map(({ label, key, type, ph }) => (
              <div key={key}>
                <label className="block text-sm font-semibold mb-1" style={{ color: '#0f172a' }}>{label}</label>
                <input
                  type={type}
                  value={form[key]}
                  onChange={set(key)}
                  placeholder={ph}
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none"
                  style={{ borderColor: '#FFD700' }}
                  required
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-black text-lg transition-colors"
              style={{ backgroundColor: loading ? '#FFC107' : '#FFD700', color: '#0f172a' }}
            >
              {loading ? 'Creating Account…' : 'Enter the Giveaway Free'}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-500">
            Already entered?{' '}
            <Link href="/login" className="font-bold hover:underline" style={{ color: '#0f172a' }}>
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
