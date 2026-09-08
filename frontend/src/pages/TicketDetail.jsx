import { useEffect, useState, useContext } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { apiRequest } from '../services/api'
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  ExternalLink,
  Laptop,
  MessageSquare,
  Send,
  User,
  Wrench,
} from 'lucide-react'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'
import UserAvatar from '../components/UserAvatar'

export default function TicketDetail() {
  const { id } = useParams()
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  const [ticket, setTicket] = useState(null)
  const [technicians, setTechnicians] = useState([])
  const [status, setStatus] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [resolution, setResolution] = useState('')
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [updatingTicket, setUpdatingTicket] = useState(false)

  const loadTicket = async () => {
    try {
      const data = await apiRequest(`/api/tickets/${id}`)
      setTicket(data.ticket)
      setStatus(data.ticket.status)
      setAssignedTo(data.ticket.assigned_to ? String(data.ticket.assigned_to) : '')
      setResolution(data.ticket.resolution || '')
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    loadTicket()
    if (user?.role !== 'EMPLOYEE') {
      apiRequest('/api/users/technicians')
        .then((data) => setTechnicians(data.users || []))
        .catch(() => {})
    }
  }, [id, user])

  const handleStatusUpdate = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    setUpdatingTicket(true)

    try {
      await apiRequest(`/api/tickets/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status,
          assigned_to: assignedTo ? Number(assignedTo) : null,
          resolution: resolution.trim() || null,
        }),
      })
      setSuccessMsg('Ticket updated successfully.')
      await loadTicket()
    } catch (updateError) {
      setError(updateError.message)
    } finally {
      setUpdatingTicket(false)
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return

    setSubmittingComment(true)
    setError('')
    try {
      await apiRequest(`/api/tickets/${id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ comment: comment.trim() }),
      })
      setComment('')
      await loadTicket()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmittingComment(false)
    }
  }

  if (error && !ticket) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">{error}</div>
        <Link to="/tickets" className="btn btn-outline-secondary d-inline-flex align-items-center gap-1">
          <ArrowLeft size={16} /> Back to Tickets
        </Link>
      </div>
    )
  }

  if (!ticket) {
    return <div className="container py-4 text-muted">Loading incident details...</div>
  }

  const isTechnicianOrManager = user?.role === 'IT_SUPPORT' || user?.role === 'IT_MANAGER'

  return (
    <div className="container-fluid px-0" style={{ maxWidth: '1080px' }}>
      {/* Navigation Breadcrumb */}
      <div className="mb-3">
        <Link to="/tickets" className="text-decoration-none text-muted small d-inline-flex align-items-center gap-1">
          <ArrowLeft size={14} /> Back to tickets
        </Link>
      </div>

      {/* Main Ticket Header Card */}
      <div className="card p-4 mb-4 shadow-sm border-0">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="font-monospace fw-bold text-muted small">{ticket.ticket_number}</span>
              <span className="text-muted">·</span>
              <span className="badge text-bg-light border">{ticket.category}</span>
              <PriorityBadge priority={ticket.priority} />
            </div>
            <h1 className="h3 fw-bold mb-1">{ticket.title}</h1>
          </div>

          <div>
            <StatusBadge status={ticket.status} />
          </div>
        </div>

        {/* Metadata Strip */}
        <div className="d-flex flex-wrap gap-4 pt-3 border-top text-muted small">
          <div className="d-flex align-items-center gap-2">
            <User size={15} />
            <span>Logged by: <strong>{ticket.creator?.name || `User #${ticket.created_by}`}</strong></span>
          </div>

          <div className="d-flex align-items-center gap-2">
            <Wrench size={15} />
            <span>
              Technician:{' '}
              <strong>
                {ticket.assigned_technician?.name || (
                  <span className="text-muted fst-italic">Unassigned</span>
                )}
              </strong>
            </span>
          </div>

          <div className="d-flex align-items-center gap-2">
            <Calendar size={15} />
            <span>Created: {new Date(ticket.created_at).toLocaleString()}</span>
          </div>

          {ticket.resolved_at && (
            <div className="d-flex align-items-center gap-2 text-success">
              <CheckCircle size={15} />
              <span>Resolved: {new Date(ticket.resolved_at).toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Description, Linked Asset, Comments */}
        <div className="col-12 col-lg-7">
          {/* Issue Description */}
          <div className="card p-4 mb-4 shadow-sm border-0">
            <h2 className="h6 fw-bold text-uppercase text-muted letter-spacing-1 mb-3">Incident Description</h2>
            <div className="p-3 rounded-2 bg-light-subtle border" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
              {ticket.description}
            </div>
          </div>

          {/* Attached Hardware Asset Card */}
          {ticket.asset && (
            <div className="card p-4 mb-4 shadow-sm border-0 bg-light-subtle border-primary-subtle">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center gap-2">
                  <Laptop size={18} className="text-primary" />
                  <h2 className="h6 fw-bold mb-0">Attached Hardware Asset</h2>
                </div>
                <Link
                  to={`/assets/${ticket.asset.id}`}
                  className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                >
                  <span>Asset Record</span>
                  <ExternalLink size={13} />
                </Link>
              </div>

              <div className="row g-2 small">
                <div className="col-6 col-sm-4">
                  <span className="text-muted d-block">Asset Tag</span>
                  <strong className="font-monospace">{ticket.asset.asset_tag}</strong>
                </div>
                <div className="col-6 col-sm-4">
                  <span className="text-muted d-block">Brand / Model</span>
                  <strong>{ticket.asset.brand} {ticket.asset.model}</strong>
                </div>
                <div className="col-6 col-sm-4">
                  <span className="text-muted d-block">Device Type</span>
                  <span>{ticket.asset.asset_type}</span>
                </div>
              </div>
            </div>
          )}

          {/* Resolution Card (if resolved/closed) */}
          {ticket.resolution && (
            <div className="card p-4 mb-4 shadow-sm border-0 bg-success-subtle text-success-emphasis border-success-subtle">
              <div className="d-flex align-items-center gap-2 mb-2">
                <CheckCircle size={18} className="text-success" />
                <h2 className="h6 fw-bold mb-0">Resolution Summary</h2>
              </div>
              <p className="mb-0 small" style={{ whiteSpace: 'pre-wrap' }}>
                {ticket.resolution}
              </p>
            </div>
          )}

          {/* Activity / Comments Thread */}
          <div className="card p-4 shadow-sm border-0">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="d-flex align-items-center gap-2">
                <MessageSquare size={18} className="text-primary" />
                <h2 className="h6 fw-bold mb-0">Communication &amp; Activity</h2>
              </div>
              <span className="badge text-bg-light border">{ticket.comments?.length || 0} notes</span>
            </div>

            <div className="d-flex flex-column gap-3 mb-4">
              {ticket.comments?.map((c) => (
                <div key={c.id} className="p-3 rounded-2 bg-light-subtle border">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <strong className="small">{c.author_name || `User #${c.user_id}`}</strong>
                      {c.author_role && (
                        <span className="badge text-bg-secondary small" style={{ fontSize: '0.65rem' }}>
                          {c.author_role}
                        </span>
                      )}
                    </div>
                    <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                      {new Date(c.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="small text-body" style={{ whiteSpace: 'pre-wrap' }}>
                    {c.comment}
                  </div>
                </div>
              ))}

              {(!ticket.comments || ticket.comments.length === 0) && (
                <p className="text-muted small mb-0 py-2">No updates or comments yet.</p>
              )}
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment}>
              <div className="mb-2">
                <label className="form-label small fw-semibold" htmlFor="comment-input">
                  Add Operational Note or User Response
                </label>
                <textarea
                  id="comment-input"
                  className="form-control form-control-sm"
                  rows="3"
                  placeholder="Type an update or resolution note..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                />
              </div>
              <div className="d-flex justify-content-end">
                <button
                  type="submit"
                  className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1"
                  disabled={submittingComment || !comment.trim()}
                >
                  <Send size={14} />
                  <span>{submittingComment ? 'Sending...' : 'Post Comment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Operational Controls (for Support & Manager) */}
        <div className="col-12 col-lg-5">
          {isTechnicianOrManager ? (
            <div className="card p-4 shadow-sm border-0 sticky-top" style={{ top: '1rem' }}>
              <h2 className="h6 fw-bold mb-3 d-flex align-items-center gap-2">
                <Wrench size={16} className="text-primary" />
                <span>Operational Controls</span>
              </h2>

              {successMsg && <div className="alert alert-success py-2 small mb-3">{successMsg}</div>}
              {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}

              <form onSubmit={handleStatusUpdate} className="d-flex flex-column gap-3">
                <div>
                  <label className="form-label small fw-semibold mb-1" htmlFor="ticket-status-select">
                    Ticket Status
                  </label>
                  <select
                    id="ticket-status-select"
                    className="form-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="Open">Open</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="form-label small fw-semibold mb-1" htmlFor="ticket-tech-select">
                    Assigned Technician
                  </label>
                  <select
                    id="ticket-tech-select"
                    className="form-select"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {technicians.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.email})
                      </option>
                    ))}
                  </select>
                </div>

                {(status === 'Resolved' || status === 'Closed' || ticket.resolution) && (
                  <div>
                    <label className="form-label small fw-semibold mb-1" htmlFor="ticket-resolution-text">
                      Resolution Notes <span className="text-danger">*</span>
                    </label>
                    <textarea
                      id="ticket-resolution-text"
                      className="form-control"
                      rows="3"
                      placeholder="Describe what action was taken to resolve the incident..."
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      required={status === 'Resolved' || status === 'Closed'}
                    />
                    <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                      Required when setting status to Resolved or Closed.
                    </small>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary d-inline-flex align-items-center justify-content-center gap-2 py-2 mt-2"
                  disabled={updatingTicket}
                >
                  <CheckCircle size={16} />
                  <span>{updatingTicket ? 'Saving changes...' : 'Update Ticket'}</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="card p-4 shadow-sm border-0">
              <h2 className="h6 fw-bold mb-2">Ticket Guidelines</h2>
              <p className="small text-muted mb-3">
                As an employee, your ticket has been routed to the IT Central Support team.
              </p>
              <div className="small text-muted d-flex flex-column gap-2">
                <div>• Add comments to provide additional details or answers requested by technicians.</div>
                <div>• Technicians will update the operational status as work progresses.</div>
                <div>• You will be notified once resolution is applied.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
