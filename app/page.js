import Link from 'next/link'
import Navbar from '@/components/Navbar'
import CountdownTimer from '@/components/CountdownTimer'
import EntrantTicker from '@/components/EntrantTicker'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={null} />

      {/* Hero */}
      <section
        className="py-24 px-4 text-center flex-1"
        style={{ background: 'linear-gradient(135deg,#FFD700 0%,#FFC107 60%,#FFAB00 100%)' }}
      >
        <div className="max-w-4xl mx-auto">
          <div
            className="inline-block rounded-full px-4 py-1 text-sm font-bold mb-6"
            style={{ backgroundColor: 'rgba(15,23,42,0.12)', color: '#0f172a' }}
          >
            🏆 Official Prize Claim Headquarters
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-3" style={{ color: '#0f172a' }}>
            PCH Official
          </h1>
          <p className="text-xl md:text-2xl font-semibold mb-4" style={{ color: '#0f172a' }}>
            Official Prize Claim Headquarters
          </p>
          <p className="text-base md:text-lg mb-6 max-w-2xl mx-auto" style={{ color: '#1e293b' }}>
            Enter our exclusive sweepstakes for a chance to win life-changing cash prizes.
            Winners are selected and notified directly through your personal dashboard.
          </p>

          {/* Countdown Timer */}
          <CountdownTimer />

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/signup"
              className="inline-block px-10 py-4 rounded-2xl text-lg font-black shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
              style={{ backgroundColor: '#0f172a', color: '#FFD700' }}
            >
              Enter Giveaway — Free →
            </Link>
            <Link
              href="/login"
              className="text-sm font-semibold underline underline-offset-2"
              style={{ color: '#0f172a' }}
            >
              Already entered? Log in
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Entrant Ticker */}
      <EntrantTicker />

      {/* How it works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-12" style={{ color: '#0f172a' }}>
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { n: '1', title: 'Sign Up Free', body: 'Create a free account to enter the PCH Official giveaway. No purchase necessary.' },
              { n: '2', title: 'Wait for Selection', body: 'Our team selects winners. Log into your dashboard to check your status at any time.' },
              { n: '3', title: 'Claim Your Prize', body: "If you're selected, you'll see a claim form on your dashboard. Submit your details to receive your prize." },
            ].map((s) => (
              <div key={s.n} className="text-center p-8 rounded-2xl border-2" style={{ borderColor: '#FFD700' }}>
                <div
                  className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center text-xl font-black"
                  style={{ backgroundColor: '#0f172a', color: '#FFD700' }}
                >
                  {s.n}
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: '#0f172a' }}>{s.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-10 px-4" style={{ backgroundColor: '#FFF9C4' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4 text-center">
          {[
            { v: '$2.4M+', l: 'Total Prizes Awarded' },
            { v: '38,000+', l: 'Winners Selected' },
            { v: '100%', l: 'Legitimate & Free' },
          ].map((s) => (
            <div key={s.l}>
              <div className="text-3xl font-black" style={{ color: '#0f172a' }}>{s.v}</div>
              <div className="text-sm text-gray-600 mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 text-center" style={{ backgroundColor: '#0f172a' }}>
        <h2 className="text-3xl font-black text-white mb-3">Ready to Win?</h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          Join thousands of participants. No purchase required. Sign up in 30 seconds.
        </p>
        <Link
          href="/signup"
          className="inline-block px-10 py-4 rounded-2xl text-lg font-black"
          style={{ backgroundColor: '#FFD700', color: '#0f172a' }}
        >
          Enter the Giveaway Free
        </Link>
      </section>

      <footer className="py-6 px-4 text-center text-sm text-gray-500 bg-gray-100">
        <p>© {new Date().getFullYear()} PCH Official — Official Prize Claim Headquarters</p>
        <p className="mt-1">All giveaways are legitimate. Winners notified via personal dashboard.</p>
      </footer>
    </div>
  )
}
