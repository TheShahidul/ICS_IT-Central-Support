import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  RotateCcw,
  Search,
  Ticket as TicketIcon,
} from 'lucide-react'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'

export default function Tickets() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [category, setCategory] = useState('')
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const loadTickets = async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (search.trim()) params.set('q', search.trim())
      if (status) params.set('status', status)
      if (priority) params.set('priority', priority)
      if (category) params.set('category', category)

      const qs = params.toString() ? `?${params.toString()}` : ''
      const response = await fetch(`/api/tickets${qs}`, { credentials: 'include' })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Unable to load tickets')
      }
      setTickets(data.tickets || [])
      setCurrentPage(1)
    } catch (err) {
      setError(err.message || 'Unable to connect to the backend')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTickets()
  }, [status, priority, category])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    loadTickets()
  }

  const resetFilters = () => {
    setSearch('')
    setStatus('')
    setPriority('')
    setCategory('')
  }

  const hasFilters = Boolean(search || status || priority || category)

  // Pagination calculation
  const totalPages = Math.ceil(tickets.length / itemsPerPage) || 1
  const paginatedTickets = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return tickets.slice(start, start + itemsPerPage)
  }, [tickets, currentPage])

  return (
    <div className="container-fluid px-0">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <TicketIcon size={22} className="text-primary" />
            <h1 className="h3 fw-bold mb-0">Ticket Management</h1>
          </div>
          <p className="text-muted small mb-0">
            Track, prioritize, and resolve enterprise IT support incidents
          </p>
        </div>

        <Link to="/tickets/new" className="btn btn-primary d-inline-flex align-items-center gap-2">
          <Plus size={16} />
          <span>Create Ticket</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-3 mb-4 shadow-sm border-0">
        <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
          <div className="col-12 col-md-4">
            <div className="input-group">
              <span className="input-group-text bg-transparent border-end-0">
                <Search size={15} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Search ticket #, title, keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="btn btn-outline-secondary" type="submit">
                Search
              </button>
            </div>
          </div>

          <div className="col-6 col-md-2">
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              aria-label="Filter by status"
            >
              <option value="">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div className="col-6 col-md-2">
            <select
              className="form-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              aria-label="Filter by priority"
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div className="col-6 col-md-2">
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Filter by category"
            >
              <option value="">All Categories</option>
              <option value="Hardware">Hardware</option>
              <option value="Software">Software</option>
              <option value="Network">Network</option>
              <option value="Account & Access">Account &amp; Access</option>
              <option value="Security">Security</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="col-6 col-md-2 d-flex justify-content-end">
            {hasFilters && (
              <button
                type="button"
                className="btn btn-outline-secondary d-inline-flex align-items-center gap-1 w-100 justify-content-center"
                onClick={resetFilters}
              >
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </form>
      </div>

      {error && <div className="alert alert-danger mb-4">{error}</div>}

      {/* Tickets Table Card */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-transparent d-flex justify-content-between align-items-center py-3">
          <div className="d-flex align-items-center gap-2">
            <span className="fw-semibold">Tickets Queue</span>
            <span className="badge text-bg-light border">{tickets.length} total</span>
          </div>
          <span className="text-muted small">
            Page {currentPage} of {totalPages}
          </span>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th style={{ width: '130px' }}>Ticket #</th>
                <th>Title &amp; Category</th>
                <th style={{ width: '130px' }}>Priority</th>
                <th style={{ width: '140px' }}>Status</th>
                <th>Assignee</th>
                <th style={{ width: '120px' }}>Created</th>
                <th style={{ width: '90px' }} className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    Loading tickets...
                  </td>
                </tr>
              ) : paginatedTickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>
                    <Link
                      to={`/tickets/${ticket.id}`}
                      className="fw-bold text-decoration-none font-monospace small"
                    >
                      {ticket.ticket_number}
                    </Link>
                  </td>
                  <td>
                    <div className="fw-semibold">{ticket.title}</div>
                    <div className="small text-muted d-flex align-items-center gap-1">
                      <span>{ticket.category}</span>
                      {ticket.asset && (
                        <>
                          <span>·</span>
                          <span className="badge bg-light text-dark border small" style={{ fontSize: '0.7rem' }}>
                            {ticket.asset.asset_tag} ({ticket.asset.brand} {ticket.asset.model})
                          </span>
                        </>
                      )}
                    </div>
                  </td>
                  <td>
                    <PriorityBadge priority={ticket.priority} />
                  </td>
                  <td>
                    <StatusBadge status={ticket.status} />
                  </td>
                  <td className="small">
                    {ticket.assigned_technician ? (
                      <span className="text-body fw-medium">{ticket.assigned_technician.name}</span>
                    ) : (
                      <span className="text-muted fst-italic">Unassigned</span>
                    )}
                  </td>
                  <td className="small text-muted">
                    {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="text-end">
                    <Link to={`/tickets/${ticket.id}`} className="btn btn-sm btn-outline-primary py-1 px-2">
                      View
                    </Link>
                  </td>
                </tr>
              ))}

              {!loading && tickets.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    <p className="text-muted mb-2">No tickets found matching your query.</p>
                    {hasFilters && (
                      <button className="btn btn-sm btn-outline-secondary" onClick={resetFilters}>
                        Clear search filters
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="card-footer bg-transparent d-flex justify-content-between align-items-center py-3">
            <span className="text-muted small">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, tickets.length)} of {tickets.length}
            </span>

            <div className="d-flex gap-1">
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              >
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`btn btn-sm ${page === currentPage ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
