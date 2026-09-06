import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function NewTicket() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', description: '', category: 'Hardware', priority: 'Medium' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value })

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Unable to create ticket')
        return
      }
      navigate(`/tickets/${data.ticket.id}`)
    } catch {
      setError('Unable to connect to the backend')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="container py-4" style={{ maxWidth: '760px' }}>
      <h1 className="h2 mb-4">Create ticket</h1>
      <form className="card card-body gap-3" onSubmit={submit}>
        <label htmlFor="title">Title</label>
        <input id="title" name="title" className="form-control" value={form.title} onChange={update} required />
        <label htmlFor="description">Description</label>
        <textarea id="description" name="description" className="form-control" rows="5" value={form.description} onChange={update} required />
        <label htmlFor="category">Category</label>
        <select id="category" name="category" className="form-select" value={form.category} onChange={update}>
          <option>Hardware</option><option>Software</option><option>Network</option><option>Account &amp; Access</option><option>Security</option><option>Other</option>
        </select>
        <label htmlFor="priority">Priority</label>
        <select id="priority" name="priority" className="form-select" value={form.priority} onChange={update}>
          <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
        </select>
        {error && <div className="alert alert-danger mb-0">{error}</div>}
        <button className="btn btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create ticket'}</button>
      </form>
    </main>
  )
}
