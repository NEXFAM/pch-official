'use client'
import { useEffect, useState } from 'react'

function calcLeft(iso) {
  const diff = new Date(iso).getTime() - Date.now()
  if (diff <= 0) return null
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
  }
}

function Seg({ v, label }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="flex items-center justify-center rounded-xl font-black tabular-nums"
        style={{
          backgroundColor: '#0f172a',
          color: '#FFD700',
          width: 'clamp(52px,10vw,72px)',
          height: 'clamp(52px,10vw,72px)',
          fontSize: 'clamp(22px,4vw,32px)',
        }}
      >
        {String(v).padStart(2, '0')}
      </div>
      <span className="mt-1 text-xs font-bold uppercase tracking-wider" style={{ color: '#0f172a', opacity: 0.6 }}>
        {label}
      </span>
    </div>
  )
}

export default function CountdownTimer() {
  const [endDate, setEndDate] = useState(null)
  const [left, setLeft] = useState(undefined)

  useEffect(() => {
    fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'get-settings' }),
    })
      .then((r) => r.json())
      .then((d) => { if (d.settings?.giveaway_end_date) setEndDate(d.settings.giveaway_end_date) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!endDate) return
    const tick = () => setLeft(calcLeft(endDate))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [endDate])

  if (left === undefined) return null

  if (left === null) {
    return (
      <div
        className="mt-4 mb-8 mx-auto max-w-lg rounded-2xl px-6 py-4 text-center font-black text-base md:text-lg"
        style={{ backgroundColor: 'rgba(15,23,42,0.15)', color: '#0f172a' }}
      >
        🔔 Giveaway ended — winner will be announced soon!
      </div>
    )
  }

  return (
    <div className="mt-4 mb-8 mx-auto max-w-lg rounded-2xl px-6 py-5" style={{ backgroundColor: 'rgba(15,23,42,0.12)' }}>
      <p className="text-center text-sm font-bold mb-4" style={{ color: '#0f172a', opacity: 0.75 }}>
        ⏰ Giveaway ends in:
      </p>
      <div className="flex justify-center gap-3 md:gap-5">
        <Seg v={left.d} label="Days" />
        <div className="font-black text-3xl md:text-4xl self-center pb-4" style={{ color: '#0f172a' }}>:</div>
        <Seg v={left.h} label="Hrs" />
        <div className="font-black text-3xl md:text-4xl self-center pb-4" style={{ color: '#0f172a' }}>:</div>
        <Seg v={left.m} label="Min" />
        <div className="font-black text-3xl md:text-4xl self-center pb-4" style={{ color: '#0f172a' }}>:</div>
        <Seg v={left.s} label="Sec" />
      </div>
    </div>
  )
}
