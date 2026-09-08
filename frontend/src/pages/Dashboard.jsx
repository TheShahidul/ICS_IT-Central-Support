import { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Laptop,
  Plus,
  ShieldAlert,
  Ticket as TicketIcon,
  Users,
} from 'lucide-react'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'

export default function Dashboard() {
  const { user } = useContext(AuthContext)
  const [summary, setSummary] = useState(null)
  const [recentTickets, setRecentTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard/summary', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/tickets', { credentials: 'include' }).then(r => r.json()),
    ])
      .then(([summaryData, ticketsData]) => {
        if (summaryData.error) throw new Error(summaryData.error)
        setSummary(summaryData)
        if (ticketsData.tickets) {
          setRecentTickets(ticketsData.tickets.slice(0, 5))
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const ticketCounts = summary?.tickets?.by_status || {}
  const priorityCounts = summary?.tickets?.by_priority || {}
  const assetCounts = summary?.assets?.by_status || {}

  const openCount = ticketCounts['Open'] || 0
  const assignedCount = ticketCounts['Assigned'] || 0
  const inProgressCount = ticketCounts['In Progress'] || 0
  const resolvedCount = ticketCounts['Resolved'] || 0
  const closedCount = ticketCounts['Closed'] || 0
  const activeCount = openCount + assignedCount + inProgressCount
  const criticalCount = priorityCounts['Critical'] || 0

  const totalTickets = summary?.tickets?.total || 0
  const totalAssets = summary?.assets?.total || 0
  const availableAssets = assetCounts['Available'] || 0
  const assignedAssets = assetCounts['Assigned'] || 0

  return (
    <div className="container-fluid px-0">
      {/* Welcome Banner */}
      <div className="card border-0 mb-4 p-4 shadow-sm" style={{
        background: 'linear-gradient(135deg, rgba(39, 116, 168, 0.08) 0%, rgba(22, 131, 107, 0.08) 100%)',
        borderRadius: '16px'
      }}>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 small">
                {user?.role}
              </span>
              <span className="text-muted small">·</span>
              <span className="text-muted small">{user?.email}</span>
            </div>
            <h1 className="h3 fw-bold mb-1">Welcome back, {user?.name}</h1>
            <p className="text-muted mb-0 small">
              {user?.role === 'EMPLOYEE'
                ? 'Submit IT support requests and monitor the resolution status of your assigned hardware.'
                : 'Central operations console for monitoring incidents, service requests, and hardware lifecycle.'}
            </p>
          </div>

          <div className="d-flex gap-2 flex-wrap">
            <Link to="/tickets/new" className="btn btn-primary d-inline-flex align-items-center gap-2">
              <Plus size={16} />
              <span>New Ticket</span>
            </Link>
            <Link to="/tickets" className="btn btn-outline-secondary d-inline-flex align-items-center gap-2">
              <TicketIcon size={16} />
              <span>Browse Tickets</span>
            </Link>
            {user?.role === 'IT_MANAGER' && (
              <Link to="/users" className="btn btn-outline-secondary d-inline-flex align-items-center gap-2">
                <Users size={16} />
                <span>User Admin</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {error && <div className="alert alert-warning mb-4">{error}</div>}

      {/* KPI Metrics Row */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="stat-card-title">Total Tickets</span>
              <span className="p-2 rounded-3 bg-primary-subtle text-primary">
                <TicketIcon size={18} />
              </span>
            </div>
            <div className="stat-card-value">{loading ? '...' : totalTickets}</div>
            <div className="stat-card-sub text-muted">
              {user?.role === 'EMPLOYEE' ? 'Logged by you' : 'Across all departments'}
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="stat-card-title">Active Queue</span>
              <span className="p-2 rounded-3 bg-warning-subtle text-warning-emphasis">
                <Clock size={18} />
              </span>
            </div>
            <div className="stat-card-value text-warning-emphasis">{loading ? '...' : activeCount}</div>
            <div className="stat-card-sub text-muted">
              {openCount} open · {inProgressCount} in progress
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="stat-card-title">Critical Severity</span>
              <span className="p-2 rounded-3 bg-danger-subtle text-danger">
                <ShieldAlert size={18} />
              </span>
            </div>
            <div className="stat-card-value text-danger">{loading ? '...' : criticalCount}</div>
            <div className="stat-card-sub text-muted">Requires urgent SLA action</div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="stat-card-title">Hardware Assets</span>
              <span className="p-2 rounded-3 bg-success-subtle text-success">
                <Laptop size={18} />
              </span>
            </div>
            <div className="stat-card-value">{loading ? '...' : totalAssets}</div>
            <div className="stat-card-sub text-muted">
              {user?.role === 'EMPLOYEE' ? 'Assigned to you' : `${availableAssets} available · ${assignedAssets} deployed`}
            </div>
          </div>
        </div>
      </div>

      {/* Progress & Visual Distribution Section */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-7">
          <div className="card h-100 p-4 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h5 fw-bold mb-0">Ticket Status Breakdown</h2>
              <span className="badge text-bg-light border">{totalTickets} Total</span>
            </div>

            {/* Visual multi-segment bar */}
            {totalTickets > 0 ? (
              <>
                <div className="breakdown-bar mb-3">
                  <div className="breakdown-segment" style={{ width: `${(openCount / totalTickets) * 100}%`, background: '#2196f3' }} title={`Open: ${openCount}`} />
                  <div className="breakdown-segment" style={{ width: `${(assignedCount / totalTickets) * 100}%`, background: '#ab47bc' }} title={`Assigned: ${assignedCount}`} />
                  <div className="breakdown-segment" style={{ width: `${(inProgressCount / totalTickets) * 100}%`, background: '#ff9800' }} title={`In Progress: ${inProgressCount}`} />
                  <div className="breakdown-segment" style={{ width: `${(resolvedCount / totalTickets) * 100}%`, background: '#4caf50' }} title={`Resolved: ${resolvedCount}`} />
                  <div className="breakdown-segment" style={{ width: `${(closedCount / totalTickets) * 100}%`, background: '#78909c' }} title={`Closed: ${closedCount}`} />
                </div>

                <div className="row g-2 text-center pt-2">
                  <div className="col">
                    <div className="small fw-semibold text-primary">Open</div>
                    <div className="h5 fw-bold mb-0">{openCount}</div>
                  </div>
                  <div className="col">
                    <div className="small fw-semibold" style={{ color: '#ab47bc' }}>Assigned</div>
                    <div className="h5 fw-bold mb-0">{assignedCount}</div>
                  </div>
                  <div className="col">
                    <div className="small fw-semibold text-warning-emphasis">In Progress</div>
                    <div className="h5 fw-bold mb-0">{inProgressCount}</div>
                  </div>
                  <div className="col">
                    <div className="small fw-semibold text-success">Resolved</div>
                    <div className="h5 fw-bold mb-0">{resolvedCount}</div>
                  </div>
                  <div className="col">
                    <div className="small fw-semibold text-muted">Closed</div>
                    <div className="h5 fw-bold mb-0">{closedCount}</div>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-muted small">No tickets currently logged.</p>
            )}
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="card h-100 p-4 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h5 fw-bold mb-0">Priority Distribution</h2>
              <span className="small text-muted">Incident Severity</span>
            </div>

            <div className="d-flex flex-column gap-2">
              {['Critical', 'High', 'Medium', 'Low'].map((p) => {
                const count = priorityCounts[p] || 0
                const pct = totalTickets > 0 ? Math.round((count / totalTickets) * 100) : 0
                return (
                  <div key={p} className="d-flex align-items-center justify-content-between p-2 rounded-2 bg-light-subtle border">
                    <div className="d-flex align-items-center gap-2">
                      <PriorityBadge priority={p} />
                    </div>
                    <div className="d-flex align-items-center gap-3">
                      <span className="small text-muted">{pct}%</span>
                      <strong className="small">{count}</strong>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Tickets Table Section */}
      <div className="card p-4 shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <div>
            <h2 className="h5 fw-bold mb-0">Recent Incident Activity</h2>
            <p className="text-muted small mb-0">Latest support requests requiring tracking and action</p>
          </div>
          <Link to="/tickets" className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1">
            <span>View all tickets</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th style={{ width: '130px' }}>Ticket #</th>
                <th>Title &amp; Category</th>
                <th style={{ width: '130px' }}>Priority</th>
                <th style={{ width: '140px' }}>Status</th>
                <th style={{ width: '120px' }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {recentTickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>
                    <Link to={`/tickets/${ticket.id}`} className="fw-bold text-decoration-none font-monospace small">
                      {ticket.ticket_number}
                    </Link>
                  </td>
                  <td>
                    <div className="fw-semibold">{ticket.title}</div>
                    <div className="small text-muted">
                      {ticket.category} {ticket.asset ? `· Attached ${ticket.asset.asset_tag}` : ''}
                    </div>
                  </td>
                  <td>
                    <PriorityBadge priority={ticket.priority} />
                  </td>
                  <td>
                    <StatusBadge status={ticket.status} />
                  </td>
                  <td className="small text-muted">
                    {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
              {recentTickets.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">
                    No tickets found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
