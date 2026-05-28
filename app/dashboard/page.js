'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardClient from '@/components/DashboardClient'
import { apiFetch } from '@/lib/apiFetch'

function DashboardSkeleton() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6 animate-pulse">
        <div className="h-8 w-48 rounded-lg bg-gray-200" />
        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <div className="h-5 w-32 rounded bg-gray-200" />
          <div className="h-4 w-full rounded bg-gray-100" />
          <div className="h-4 w-3/4 rounded bg-gray-100" />
        </div>
        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <div className="h-5 w-40 rounded bg-gray-200" />
          <div className="h-12 w-full rounded-xl bg-gray-100" />
          <div className="h-12 w-full rounded-xl bg-gray-100" />
        </div>
        <div className="bg-white rounded-2xl shadow p-6 space-y-3">
          <div className="h-5 w-36 rounded bg-gray-200" />
          <div className="h-4 w-full rounded bg-gray-100" />
          <div className="h-4 w-5/6 rounded bg-gray-100" />
          <div className="h-4 w-2/3 rounded bg-gray-100" />
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch('get-user')
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

  if (loading) return <DashboardSkeleton />
  if (!user) return null

  return <DashboardClient user={user} />
}
