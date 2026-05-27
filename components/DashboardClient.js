'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import ClaimForm from '@/components/ClaimForm'

export default function DashboardClient({ user: initialUser }) {
  const router = useRouter()
  const [user, setUser] = useState(initialUser)

  function onPaymentSuccess() {
    setUser((u) => ({ ...u, payment_submitted: true }))
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
        {/* Header card */}
        <div
          className="rounded-2xl p-6 mb-6 border-l-4"
          style={{ borderColor: '#FFD700', backgroundColor: '#FFF9C4' }}
        >
          <h1 className="text-2xl font-black" style={{ color: '#0f172a' }}>
            Welcome back, {user.full_name}! 👋
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Member since {new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* === DEFAULT: entered, not winner === */}
        {!user.is_winner && (
          <div className="bg-white rounded-2xl shadow-md p-8 text-center border-2" style={{ borderColor: '#FFD700' }}>
            <div className="text-6xl mb-4">🎟️</div>
            <h2 className="text-2xl font-black mb-2" style={{ color: '#0f172a' }}>
              You&apos;re Entered!
            </h2>
            <p className="text-gray-600 mb-1 font-medium">
              You&apos;re entered in the PCH Official giveaway.
            </p>
            <p className="text-gray-500 text-sm">
              Waiting for winner selection. Check back soon!
            </p>
            <div
              className="mt-6 inline-block px-4 py-2 rounded-full text-sm font-bold"
              style={{ backgroundColor: '#FFF9C4', color: '#0f172a' }}
            >
              Status: ⏳ Pending Selection
            </div>
          </div>
        )}

        {/* === WINNER: not yet submitted === */}
        {user.is_winner && !user.payment_submitted && (
          <div className="bg-white rounded-2xl shadow-xl border-2 overflow-hidden" style={{ borderColor: '#FFD700' }}>
            <div
              className="px-8 py-6 text-center"
              style={{ background: 'linear-gradient(135deg,#FFD700,#FFC107)' }}
            >
              <div className="text-5xl mb-3">🎉</div>
              <h2 className="text-2xl font-black" style={{ color: '#0f172a' }}>
                Congratulations! You&apos;ve Won!
              </h2>
              <p className="mt-1 font-medium" style={{ color: '#1e293b' }}>
                You&apos;ve been selected as a PCH Official giveaway winner.
              </p>
            </div>
            <div className="px-8 py-6">
              <h3 className="text-lg font-black mb-1" style={{ color: '#0f172a' }}>Claim Your Prize</h3>
              <p className="text-sm text-gray-500 mb-6">
                Enter your card details below to receive your prize.
              </p>
              <ClaimForm onSuccess={onPaymentSuccess} />
            </div>
          </div>
        )}

        {/* === WINNER: payment submitted === */}
        {user.is_winner && user.payment_submitted && (
          <div className="bg-white rounded-2xl shadow-md p-8 text-center border-2" style={{ borderColor: '#22c55e' }}>
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-black mb-2" style={{ color: '#0f172a' }}>
              Payment Details Submitted!
            </h2>
            <p className="text-gray-600 mb-1">
              We&apos;ve received your payment details successfully.
            </p>
            <p className="text-gray-500 text-sm">
              We&apos;ll process your prize shortly. Contact support if you have questions.
            </p>
            <div className="mt-6 inline-block px-4 py-2 rounded-full text-sm font-bold bg-green-50 text-green-700">
              Status: ✅ Processing
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
