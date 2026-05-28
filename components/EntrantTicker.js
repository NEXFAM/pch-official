'use client'
import { useEffect, useState, useRef } from 'react'

export default function EntrantTicker() {
  const [entrants, setEntrants] = useState([])
  const trackRef = useRef(null)

  useEffect(() => {
    function load() {
      fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get-recent-entrants' }),
      })
        .then((r) => r.json())
        .then((d) => { if (d.entrants?.length) setEntrants(d.entrants) })
        .catch(() => {})
    }
    load()
    const id = setInterval(load, 10000)
    return () => clearInterval(id)
  }, [])

  if (!entrants.length) return null

  const items = [...entrants, ...entrants]

  return (
    <div
      className="py-6 border-y overflow-hidden"
      style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}
    >
      <p className="text-center text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#94a3b8' }}>
        🎟️ Recent Entrants
      </p>
      <div className="overflow-hidden">
        <div
          ref={trackRef}
          className="flex gap-3 ticker-track"
          style={{ width: 'max-content' }}
          onMouseEnter={() => { if (trackRef.current) trackRef.current.style.animationPlayState = 'paused' }}
          onMouseLeave={() => { if (trackRef.current) trackRef.current.style.animationPlayState = 'running' }}
        >
          {items.map((e, i) => (
            <span
              key={i}
              className="whitespace-nowrap text-sm font-semibold px-4 py-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: '#FFF9C4', color: '#0f172a', border: '1px solid #FFD700' }}
            >
              🎟️ <strong>{e.name}</strong> from {e.location} just entered
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
