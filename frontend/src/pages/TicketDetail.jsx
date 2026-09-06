import { useEffect, useState } from 'react'
import { useContext } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { apiRequest } from '../services/api'

export default function TicketDetail() {
  const { id } = useParams()
  const { user } = useContext(AuthContext)
  const [ticket, setTicket] = useState(null)
  const [technicians, setTechnicians] = useState([])
  const [status, setStatus] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [resolution, setResolution] = useState('')
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')

  const loadTicket = async () => {
    const data = await apiRequest(`/api/tickets/${id}`)
    setTicket(data.ticket)
    setStatus(data.ticket.status)
    setAssignedTo(data.ticket.assigned_to ? String(data.ticket.assigned_to) : '')
    setResolution(data.ticket.resolution || '')
  }

  useEffect(() => {
    loadTicket().catch((loadError) => setError(loadError.message))
    if (user?.role !== 'EMPLOYEE') {
      apiRequest('/api/users/technicians')
        .then((data) => setTechnicians(data.users))
        .catch((loadError) => setError(loadError.message))
    }
  }, [id])

  const updateTicket = async (event) => {
    event.preventDefault()
    try {
      await apiRequest(`/api/tickets/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status,
          assigned_to: assignedTo ? Number(assignedTo) : null,
          resolution: resolution || null,
        }),
      })
      await loadTicket()
    } catch (updateError) {
      setError(updateError.message)
    }
  }

  const addComment = async (event) => {
    event.preventDefault()
    const response = await fetch(`/api/tickets/${id}/comments`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ comment }),
    })
    const data = await response.json()
    if (!response.ok) { setError(data.error || 'Unable to add comment'); return }
    setComment('')
    loadTicket().catch((loadError) => setError(loadError.message))
  }

  if (error) return <main className="container py-4"><div className="alert alert-danger">{error}</div></main>
  if (!ticket) return <main className="container py-4">Loading ticket...</main>

  return (
    <main className="container py-4" style={{ maxWidth: '900px' }}>
      <Link to="/tickets">Back to tickets</Link>
      <div className="card card-body mt-3">
        <div className="d-flex justify-content-between"><h1 className="h3">{ticket.ticket_number}: {ticket.title}</h1><span>{ticket.status}</span></div>
        <p className="text-muted">{ticket.category} · {ticket.priority}</p>
        <p>{ticket.description}</p>
        {ticket.resolution && <p><strong>Resolution:</strong> {ticket.resolution}</p>}
      </div>
      {user?.role !== 'EMPLOYEE' && <form className="card card-body mt-3" onSubmit={updateTicket}>
        <h2 className="h5">Operational update</h2>
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label" htmlFor="ticket-status">Status</label>
            <select id="ticket-status" className="form-select" value={status} onChange={(event) => setStatus(event.target.value)}>
              <option>Open</option><option>Assigned</option><option>In Progress</option><option>Resolved</option><option>Closed</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="ticket-technician">Technician</label>
            <select id="ticket-technician" className="form-select" value={assignedTo} onChange={(event) => setAssignedTo(event.target.value)}>
              <option value="">Unassigned</option>
              {technicians.map((technician) => <option value={technician.id} key={technician.id}>{technician.name}</option>)}
            </select>
          </div>
          <div className="col-12">
            <label className="form-label" htmlFor="ticket-resolution">Resolution</label>
            <textarea id="ticket-resolution" className="form-control" rows="2" value={resolution} onChange={(event) => setResolution(event.target.value)} />
          </div>
        </div>
        <button className="btn btn-primary align-self-start mt-3">Save update</button>
      </form>}
      <section className="mt-4">
        <h2 className="h5">Comments</h2>
        {ticket.comments.map((item) => <div className="border-bottom py-2" key={item.id}>{item.comment}<small className="d-block text-muted">{new Date(item.created_at).toLocaleString()}</small></div>)}
        <form className="mt-3" onSubmit={addComment}>
          <label className="form-label" htmlFor="comment">Add a comment</label>
          <textarea id="comment" className="form-control mb-2" rows="3" value={comment} onChange={(event) => setComment(event.target.value)} required />
          <button className="btn btn-outline-primary">Add comment</button>
        </form>
      </section>
    </main>
  )
}
