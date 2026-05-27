import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { getDb } from '@/lib/db'
import DashboardClient from '@/components/DashboardClient'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session?.id) redirect('/login')

  const db = await getDb()
  const user = db
    .prepare(
      `SELECT id, full_name, email, is_winner, winner_at,
              payment_submitted, payment_submitted_at, created_at
       FROM users WHERE id = ?`
    )
    .get(session.id)

  if (!user) redirect('/login')

  return (
    <DashboardClient
      user={{
        ...user,
        is_winner: user.is_winner === 1,
        payment_submitted: user.payment_submitted === 1,
      }}
    />
  )
}
