import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function Tickets() {
  const [tickets, setTickets] = useState([])
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const loadTickets = async () => {
      const query = status ? `?status=${encodeURIComponent(status)}` : ''
      const response = await fetch(`/api/tickets${query}`, { credentials: 'include' })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Unable to load tickets')
        return
      }
      setTickets(data.tickets)
    }
    loadTickets().catch(() => setError('Unable to connect to the backend'))
  }, [status])

  return (
    <main className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2 mb-0">Tickets</h1>
        <Link className="btn btn-primary" to="/tickets/new">New ticket</Link>
      </div>
      <div className="mb-3" style={{ maxWidth: '240px' }}>
        <label className="form-label" htmlFor="status">Filter by status</label>
        <select id="status" className="form-select" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">All statuses</option>
          <option>Open</option>
          <option>Assigned</option>
          <option>In Progress</option>
          <option>Resolved</option>
          <option>Closed</option>
        </select>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="table-responsive card">
        <table className="table table-hover mb-0">
          <thead><tr><th>Number</th><th>Title</th><th>Priority</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id}>
                <td><Link to={`/tickets/${ticket.id}`}>{ticket.ticket_number}</Link></td>
                <td>{ticket.title}</td>
                <td>{ticket.priority}</td>
                <td>{ticket.status}</td>
                <td>{new Date(ticket.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {tickets.length === 0 && <tr><td colSpan="5" className="text-center py-4">No tickets found.</td></tr>}
          </tbody>
        </table>
      </div>
    </main>
  )
}
