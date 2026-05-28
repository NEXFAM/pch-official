'use client'
import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/apiFetch'

function timeAgo(dateString) {
  const diff = Date.now() - new Date(dateString).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'today'
  if (days === 1) return '1 day ago'
  if (days < 30) return `${days} days ago`
  if (days < 60) return '1 month ago'
  return `${Math.floor(days / 30)} months ago`
}

export default function WinnerBar() {
  const [notifications, setNotifications] = useState([])
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    apiFetch('get-notifications')
      .then((d) => { if (d.notifications?.length) setNotifications(d.notifications) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (notifications.length < 2) return
    const id = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex((i) => (i + 1) % notifications.length)
        setVisible(true)
      }, 500)
    }, 6000)
    return () => clearInterval(id)
  }, [notifications])

  if (!notifications.length) return <div className="h-10" />

  const n = notifications[index]
  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 h-10 flex items-center justify-center text-sm font-semibold shadow-sm"
      style={{ background: 'linear-gradient(90deg,#FFD700,#FFC107)' }}
    >
      <span
        className="transition-opacity duration-500"
        style={{ opacity: visible ? 1 : 0, color: '#0f172a' }}
      >
        🎉&nbsp;<strong>{n.winner_name}</strong> won{' '}
        <strong>${Number(n.amount).toLocaleString()}</strong>&nbsp;—&nbsp;
        {timeAgo(n.won_at)}
      </span>
    </div>
  )
}
