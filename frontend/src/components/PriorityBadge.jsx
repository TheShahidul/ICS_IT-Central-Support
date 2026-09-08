import React from 'react'
import { AlertCircle, AlertTriangle, ArrowDown, ArrowUp } from 'lucide-react'

export default function PriorityBadge({ priority }) {
  if (!priority) return null

  const normalized = String(priority).toLowerCase()

  const getIcon = () => {
    switch (normalized) {
      case 'critical':
        return <AlertCircle size={13} className="me-1" aria-hidden="true" />
      case 'high':
        return <ArrowUp size={13} className="me-1" aria-hidden="true" />
      case 'medium':
        return <AlertTriangle size={13} className="me-1" aria-hidden="true" />
      case 'low':
        return <ArrowDown size={13} className="me-1" aria-hidden="true" />
      default:
        return null
    }
  }

  return (
    <span className={`priority-badge priority-badge--${normalized}`}>
      {getIcon()}
      <span>{priority}</span>
    </span>
  )
}
