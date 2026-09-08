import React from 'react'

export default function StatusBadge({ status }) {
  if (!status) return null

  const normalized = String(status).toLowerCase().replace(/[\s_]+/g, '-')

  return (
    <span className={`status-badge status-badge--${normalized}`}>
      <span className="status-dot" aria-hidden="true"></span>
      <span>{status}</span>
    </span>
  )
}
