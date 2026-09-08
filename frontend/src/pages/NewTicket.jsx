import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Check, Laptop, PlusCircle } from 'lucide-react'

export default function NewTicket() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Hardware',
    priority: 'Medium',
    asset_id: '',
  })
  const [assets, setAssets] = useState([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/assets', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.assets) setAssets(data.assets)
      })
      .catch(() => {})
  }, [])

  const update = (event) => {
    const { name, value } = event.target
    setForm({ ...form, [name]: value })
  }

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      priority: form.priority,
      asset_id: form.asset_id ? Number(form.asset_id) : null,
    }

    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Unable to create ticket')
        return
      }
      navigate(`/tickets/${data.ticket.id}`)
    } catch {
      setError('Unable to connect to the backend server')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container-fluid px-0" style={{ maxWidth: '780px' }}>
      <div className="mb-3">
        <Link to="/tickets" className="text-decoration-none text-muted small d-inline-flex align-items-center gap-1">
          <ArrowLeft size={14} /> Back to tickets
        </Link>
      </div>

      <div className="card p-4 shadow-sm border-0">
        <div className="d-flex align-items-center gap-2 mb-2">
          <PlusCircle size={22} className="text-primary" />
          <h1 className="h4 fw-bold mb-0">Create IT Support Request</h1>
        </div>
        <p className="text-muted small mb-4">
          Submit an incident or service request to the IT Central Support team
        </p>

        {error && <div className="alert alert-danger py-2 small mb-4">{error}</div>}

        <form onSubmit={submit} className="d-flex flex-column gap-3">
          <div>
            <label htmlFor="title" className="form-label fw-semibold small">
              Subject / Title <span className="text-danger">*</span>
            </label>
            <input
              id="title"
              name="title"
              className="form-control"
              placeholder="e.g. Laptop screen flickering intermittently"
              value={form.title}
              onChange={update}
              required
            />
          </div>

          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label htmlFor="category" className="form-label fw-semibold small">
                Category <span className="text-danger">*</span>
              </label>
              <select
                id="category"
                name="category"
                className="form-select"
                value={form.category}
                onChange={update}
              >
                <option value="Hardware">Hardware (Laptops, Monitors, Peripherals)</option>
                <option value="Software">Software (OS, Office, Business Apps)</option>
                <option value="Network">Network (Wi-Fi, VPN, LAN)</option>
                <option value="Account & Access">Account &amp; Access (Passwords, Permissions)</option>
                <option value="Security">Security (Phishing, Malware, Suspicious Activity)</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="col-12 col-md-6">
              <label htmlFor="priority" className="form-label fw-semibold small">
                Priority Severity <span className="text-danger">*</span>
              </label>
              <select
                id="priority"
                name="priority"
                className="form-select"
                value={form.priority}
                onChange={update}
              >
                <option value="Low">Low (General inquiry, non-urgent)</option>
                <option value="Medium">Medium (Standard business impact)</option>
                <option value="High">High (Impacting productivity)</option>
                <option value="Critical">Critical (Complete blocker / outage)</option>
              </select>
            </div>
          </div>

          {/* Linked Hardware Asset Selector */}
          <div>
            <label htmlFor="asset_id" className="form-label fw-semibold small d-flex align-items-center gap-1">
              <Laptop size={14} className="text-muted" />
              <span>Related Hardware Asset (Optional)</span>
            </label>
            <select
              id="asset_id"
              name="asset_id"
              className="form-select"
              value={form.asset_id}
              onChange={update}
            >
              <option value="">None / General software or service request</option>
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.asset_tag} — {asset.brand} {asset.model} ({asset.asset_type})
                </option>
              ))}
            </select>
            <small className="text-muted">
              Select the hardware device experiencing issues to accelerate troubleshooting.
            </small>
          </div>

          <div>
            <label htmlFor="description" className="form-label fw-semibold small">
              Detailed Description <span className="text-danger">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              className="form-control"
              rows="5"
              placeholder="Provide context, error messages, steps taken, or exact behavior observed..."
              value={form.description}
              onChange={update}
              required
            />
          </div>

          <div className="d-flex justify-content-end gap-2 pt-2 border-top">
            <Link to="/tickets" className="btn btn-outline-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary d-inline-flex align-items-center gap-2"
              disabled={saving}
            >
              <Check size={16} />
              <span>{saving ? 'Creating ticket...' : 'Submit Ticket'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
