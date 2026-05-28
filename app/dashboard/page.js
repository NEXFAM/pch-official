'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardClient from '@/components/DashboardClient'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'get-user' }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setUser({
            ...d.user,
            is_winner: d.user.is_winner === 1,
            payment_submitted: d.user.payment_submitted === 1,
          })
        } else {
          router.push('/login')
        }
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false))
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading…</p>
      </div>
    )
  }

  if (!user) return null

  return <DashboardClient user={user} />
}
