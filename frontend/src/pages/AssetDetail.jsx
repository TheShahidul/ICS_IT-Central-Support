import { useEffect, useState, useContext } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import {
  ArrowLeft,
  Calendar,
  Check,
  Edit,
  ExternalLink,
  Laptop,
  ShieldCheck,
  Ticket,
  User,
  X,
} from 'lucide-react'
import AssetIcon from '../components/AssetIcon'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'

export default function AssetDetail() {
  const { id } = useParams()
  const { user } = useContext(AuthContext)

  const [asset, setAsset] = useState(null)
  const [relatedTickets, setRelatedTickets] = useState([])
  const [departments, setDepartments] = useState([])
  const [usersList, setUsersList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Edit Modal
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({
    status: '',
    assigned_to: '',
    department_id: '',
    warranty_expiry: '',
    notes: '',
  })
  const [modalSaving, setModalSaving] = useState(false)
  const [modalError, setModalError] = useState('')

  const isTechnicianOrManager = user?.role === 'IT_SUPPORT' || user?.role === 'IT_MANAGER'

  const loadAssetData = async () => {
    setLoading(true)
    setError('')
    try {
      const [assetRes, ticketsRes] = await Promise.all([
        fetch(`/api/assets/${id}`, { credentials: 'include' }).then((r) => r.json()),
        fetch(`/api/assets/${id}/tickets`, { credentials: 'include' }).then((r) => r.json()),
      ])

      if (assetRes.error) throw new Error(assetRes.error)
      setAsset(assetRes.asset)
      setRelatedTickets(ticketsRes.tickets || [])

      setEditForm({
        status: assetRes.asset.status,
        assigned_to: assetRes.asset.assigned_to ? String(assetRes.asset.assigned_to) : '',
        department_id: assetRes.asset.department_id ? String(assetRes.asset.department_id) : '',
        warranty_expiry: assetRes.asset.warranty_expiry || '',
        notes: assetRes.asset.notes || '',
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAssetData()
    if (isTechnicianOrManager) {
      fetch('/api/departments', { credentials: 'include' })
        .then((r) => r.json())
        .then((d) => setDepartments(d.departments || []))
        .catch(() => {})

      if (user?.role === 'IT_MANAGER') {
        fetch('/api/users', { credentials: 'include' })
          .then((r) => r.json())
          .then((d) => setUsersList(d.users || []))
          .catch(() => {})
      } else {
        fetch('/api/users/technicians', { credentials: 'include' })
          .then((r) => r.json())
          .then((d) => setUsersList(d.users || []))
          .catch(() => {})
      }
    }
  }, [id, user])

  const handleUpdateAsset = async (e) => {
    e.preventDefault()
    setModalSaving(true)
    setModalError('')

    const payload = {
      status: editForm.status,
      assigned_to: editForm.status === 'Available' ? null : (editForm.assigned_to ? Number(editForm.assigned_to) : null),
      department_id: editForm.department_id ? Number(editForm.department_id) : undefined,
      warranty_expiry: editForm.warranty_expiry || null,
      notes: editForm.notes.trim() || null,
    }

    try {
      const res = await fetch(`/api/assets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to update asset')

      setShowEditModal(false)
      setSuccessMsg('Asset hardware record updated successfully.')
      await loadAssetData()
    } catch (err) {
      setModalError(err.message)
    } finally {
      setModalSaving(false)
    }
  }

  if (loading) {
    return <div className="container py-4 text-muted">Loading asset specifications...</div>
  }

  if (error && !asset) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">{error}</div>
        <Link to="/assets" className="btn btn-outline-secondary d-inline-flex align-items-center gap-1">
          <ArrowLeft size={16} /> Back to Assets
        </Link>
      </div>
    )
  }

  return (
    <div className="container-fluid px-0" style={{ maxWidth: '1080px' }}>
      <div className="mb-3">
        <Link to="/assets" className="text-decoration-none text-muted small d-inline-flex align-items-center gap-1">
          <ArrowLeft size={14} /> Back to asset inventory
        </Link>
      </div>

      {successMsg && <div className="alert alert-success py-2 small mb-3">{successMsg}</div>}
      {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}

      {/* Main Asset Banner */}
      <div className="card p-4 mb-4 shadow-sm border-0">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3">
          <div className="d-flex align-items-center gap-3">
            <span className="asset-hero-icon p-3 rounded-3 bg-light text-primary">
              <AssetIcon type={asset.asset_type} size={36} />
            </span>
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <h1 className="h3 fw-bold mb-0 font-monospace">{asset.asset_tag}</h1>
                <StatusBadge status={asset.status} />
              </div>
              <p className="text-muted mb-0">
                {asset.brand} {asset.model} · {asset.asset_type}
              </p>
            </div>
          </div>

          {isTechnicianOrManager && (
            <button
              type="button"
              className="btn btn-outline-primary d-inline-flex align-items-center gap-2"
              onClick={() => setShowEditModal(true)}
            >
              <Edit size={15} />
              <span>Edit Asset Details</span>
            </button>
          )}
        </div>

        {/* Specifications Grid */}
        <div className="row g-3 pt-3 border-top small">
          <div className="col-6 col-md-3">
            <span className="text-muted d-block">Department</span>
            <strong>{asset.department_name || `Dept #${asset.department_id}`}</strong>
          </div>

          <div className="col-6 col-md-3">
            <span className="text-muted d-block">Assigned Custodian</span>
            <strong>
              {asset.assigned_user_name ? (
                <span>{asset.assigned_user_name}</span>
              ) : (
                <span className="text-muted fst-italic">Unassigned (Pool)</span>
              )}
            </strong>
          </div>

          <div className="col-6 col-md-3">
            <span className="text-muted d-block">Serial Number</span>
            <strong className="font-monospace">{asset.serial_number || 'Not Recorded'}</strong>
          </div>

          <div className="col-6 col-md-3">
            <span className="text-muted d-block">Warranty Expiry</span>
            <strong>{asset.warranty_expiry || 'Unknown'}</strong>
          </div>
        </div>

        {asset.notes && (
          <div className="mt-3 pt-3 border-top">
            <span className="text-muted small d-block mb-1">Asset Operational Notes:</span>
            <div className="p-2 rounded bg-light-subtle small border">{asset.notes}</div>
          </div>
        )}
      </div>

      {/* Related Tickets Section */}
      <div className="card p-4 shadow-sm border-0">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center gap-2">
            <Ticket size={20} className="text-primary" />
            <h2 className="h5 fw-bold mb-0">Incident &amp; Maintenance History</h2>
          </div>
          <span className="badge text-bg-light border">{relatedTickets.length} incidents</span>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th style={{ width: '130px' }}>Ticket #</th>
                <th>Title &amp; Category</th>
                <th style={{ width: '130px' }}>Priority</th>
                <th style={{ width: '140px' }}>Status</th>
                <th style={{ width: '130px' }}>Date</th>
                <th style={{ width: '80px' }} className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {relatedTickets.map((t) => (
                <tr key={t.id}>
                  <td>
                    <Link to={`/tickets/${t.id}`} className="font-monospace fw-bold small text-decoration-none">
                      {t.ticket_number}
                    </Link>
                  </td>
                  <td>
                    <div className="fw-semibold">{t.title}</div>
                    <span className="small text-muted">{t.category}</span>
                  </td>
                  <td>
                    <PriorityBadge priority={t.priority} />
                  </td>
                  <td>
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="small text-muted">
                    {t.created_at ? new Date(t.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="text-end">
                    <Link to={`/tickets/${t.id}`} className="btn btn-sm btn-outline-secondary py-1 px-2">
                      <ExternalLink size={13} />
                    </Link>
                  </td>
                </tr>
              ))}

              {relatedTickets.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted small">
                    No support tickets or maintenance incidents logged against this hardware asset.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Asset Modal */}
      {showEditModal && (
        <div className="modal-backdrop-custom">
          <div className="modal-content-custom p-4">
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <h2 className="h5 fw-bold mb-0">Edit Asset {asset.asset_tag}</h2>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary p-1"
                onClick={() => setShowEditModal(false)}
              >
                <X size={16} />
              </button>
            </div>

            {modalError && <div className="alert alert-danger py-2 small mb-3">{modalError}</div>}

            <form onSubmit={handleUpdateAsset} className="d-flex flex-column gap-3">
              <div className="row g-3">
                <div className="col-12 col-sm-6">
                  <label className="form-label small fw-semibold mb-1" htmlFor="edit-status">
                    Lifecycle Status
                  </label>
                  <select
                    id="edit-status"
                    className="form-select"
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  >
                    <option value="Available">Available (Unassigned)</option>
                    <option value="Assigned">Assigned (In Use)</option>
                    <option value="Under Repair">Under Repair</option>
                    <option value="Retired">Retired</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>

                <div className="col-12 col-sm-6">
                  <label className="form-label small fw-semibold mb-1" htmlFor="edit-dept">
                    Department
                  </label>
                  <select
                    id="edit-dept"
                    className="form-select"
                    value={editForm.department_id}
                    onChange={(e) => setEditForm({ ...editForm, department_id: e.target.value })}
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {editForm.status === 'Assigned' && (
                <div>
                  <label className="form-label small fw-semibold mb-1" htmlFor="edit-user">
                    Assign Custodian User ID / Name <span className="text-danger">*</span>
                  </label>
                  {usersList.length > 0 ? (
                    <select
                      id="edit-user"
                      className="form-select"
                      value={editForm.assigned_to}
                      onChange={(e) => setEditForm({ ...editForm, assigned_to: e.target.value })}
                      required
                    >
                      <option value="">Select active employee/technician...</option>
                      {usersList.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.email})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id="edit-user"
                      type="number"
                      className="form-control"
                      placeholder="Enter employee User ID (e.g. 1)"
                      value={editForm.assigned_to}
                      onChange={(e) => setEditForm({ ...editForm, assigned_to: e.target.value })}
                      required
                    />
                  )}
                </div>
              )}

              <div>
                <label className="form-label small fw-semibold mb-1" htmlFor="edit-warranty">
                  Warranty Expiry Date
                </label>
                <input
                  id="edit-warranty"
                  type="date"
                  className="form-control"
                  value={editForm.warranty_expiry}
                  onChange={(e) => setEditForm({ ...editForm, warranty_expiry: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label small fw-semibold mb-1" htmlFor="edit-notes">
                  Operational &amp; Maintenance Notes
                </label>
                <textarea
                  id="edit-notes"
                  className="form-control"
                  rows="3"
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                />
              </div>

              <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary d-inline-flex align-items-center gap-1"
                  disabled={modalSaving}
                >
                  <Check size={16} />
                  <span>{modalSaving ? 'Saving...' : 'Save Updates'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
