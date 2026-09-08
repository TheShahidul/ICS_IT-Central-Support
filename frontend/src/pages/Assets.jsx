import { useEffect, useState, useContext, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import {
  ChevronLeft,
  ChevronRight,
  Laptop,
  Plus,
  RotateCcw,
  Search,
  X,
} from 'lucide-react'
import AssetIcon from '../components/AssetIcon'
import StatusBadge from '../components/StatusBadge'

export default function Assets() {
  const { user } = useContext(AuthContext)
  const [assets, setAssets] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Search & Filters
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [assetType, setAssetType] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Modal State for New Asset
  const [showModal, setShowModal] = useState(false)
  const [newAssetForm, setNewAssetForm] = useState({
    asset_type: 'Laptop',
    brand: '',
    model: '',
    serial_number: '',
    department_id: '',
    status: 'Available',
    purchase_date: '',
    warranty_expiry: '',
    notes: '',
  })
  const [modalSaving, setModalSaving] = useState(false)
  const [modalError, setModalError] = useState('')

  const isTechnicianOrManager = user?.role === 'IT_SUPPORT' || user?.role === 'IT_MANAGER'

  const loadDepartments = async () => {
    try {
      const res = await fetch('/api/departments', { credentials: 'include' })
      const data = await res.json()
      if (data.departments) {
        setDepartments(data.departments)
        if (!newAssetForm.department_id && data.departments.length > 0) {
          setNewAssetForm((prev) => ({ ...prev, department_id: data.departments[0].id }))
        }
      }
    } catch {}
  }

  const loadAssets = async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (search.trim()) params.set('q', search.trim())
      if (status) params.set('status', status)
      if (assetType) params.set('asset_type', assetType)
      if (departmentId) params.set('department_id', departmentId)

      const qs = params.toString() ? `?${params.toString()}` : ''
      const res = await fetch(`/api/assets${qs}`, { credentials: 'include' })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Unable to load assets')
      setAssets(data.assets || [])
      setCurrentPage(1)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDepartments()
  }, [])

  useEffect(() => {
    loadAssets()
  }, [status, assetType, departmentId])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    loadAssets()
  }

  const resetFilters = () => {
    setSearch('')
    setStatus('')
    setAssetType('')
    setDepartmentId('')
  }

  const handleCreateAsset = async (e) => {
    e.preventDefault()
    setModalSaving(true)
    setModalError('')

    try {
      const payload = {
        asset_type: newAssetForm.asset_type,
        brand: newAssetForm.brand.trim(),
        model: newAssetForm.model.trim(),
        serial_number: newAssetForm.serial_number.trim() || null,
        department_id: Number(newAssetForm.department_id),
        status: newAssetForm.status,
        purchase_date: newAssetForm.purchase_date || null,
        warranty_expiry: newAssetForm.warranty_expiry || null,
        notes: newAssetForm.notes.trim() || null,
      }

      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to register asset')
      }

      setShowModal(false)
      setNewAssetForm({
        asset_type: 'Laptop',
        brand: '',
        model: '',
        serial_number: '',
        department_id: departments[0]?.id || '',
        status: 'Available',
        purchase_date: '',
        warranty_expiry: '',
        notes: '',
      })
      await loadAssets()
    } catch (err) {
      setModalError(err.message)
    } finally {
      setModalSaving(false)
    }
  }

  const hasFilters = Boolean(search || status || assetType || departmentId)

  // Pagination
  const totalPages = Math.ceil(assets.length / itemsPerPage) || 1
  const paginatedAssets = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return assets.slice(start, start + itemsPerPage)
  }, [assets, currentPage])

  return (
    <div className="container-fluid px-0">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <Laptop size={22} className="text-primary" />
            <h1 className="h3 fw-bold mb-0">Hardware Asset Inventory</h1>
          </div>
          <p className="text-muted small mb-0">
            Lifecycle monitoring, procurement tracking, and workstation allocation
          </p>
        </div>

        {isTechnicianOrManager && (
          <button
            type="button"
            className="btn btn-primary d-inline-flex align-items-center gap-2"
            onClick={() => setShowModal(true)}
          >
            <Plus size={16} />
            <span>Register Asset</span>
          </button>
        )}
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
                placeholder="Search tag, brand, model, serial..."
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
              value={assetType}
              onChange={(e) => setAssetType(e.target.value)}
              aria-label="Filter by type"
            >
              <option value="">All Device Types</option>
              <option value="Laptop">Laptop</option>
              <option value="Desktop">Desktop</option>
              <option value="Monitor">Monitor</option>
              <option value="Printer">Printer</option>
              <option value="Router">Router</option>
              <option value="Switch">Switch</option>
              <option value="Mobile Device">Mobile Device</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="col-6 col-md-2">
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              aria-label="Filter by status"
            >
              <option value="">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Assigned">Assigned</option>
              <option value="Under Repair">Under Repair</option>
              <option value="Retired">Retired</option>
              <option value="Lost">Lost</option>
            </select>
          </div>

          <div className="col-6 col-md-2">
            <select
              className="form-select"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              aria-label="Filter by department"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
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

      {/* Assets Table Card */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-transparent d-flex justify-content-between align-items-center py-3">
          <div className="d-flex align-items-center gap-2">
            <span className="fw-semibold">Asset Roster</span>
            <span className="badge text-bg-light border">{assets.length} total</span>
          </div>
          <span className="text-muted small">
            Page {currentPage} of {totalPages}
          </span>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th style={{ width: '130px' }}>Asset Tag</th>
                <th style={{ width: '140px' }}>Type</th>
                <th>Brand &amp; Model</th>
                <th>Department</th>
                <th style={{ width: '140px' }}>Status</th>
                <th>Assigned User</th>
                <th style={{ width: '90px' }} className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    Loading assets...
                  </td>
                </tr>
              ) : paginatedAssets.map((asset) => (
                <tr key={asset.id}>
                  <td>
                    <Link
                      to={`/assets/${asset.id}`}
                      className="fw-bold text-decoration-none font-monospace small"
                    >
                      {asset.asset_tag}
                    </Link>
                  </td>
                  <td>
                    <span className="d-inline-flex align-items-center gap-2 small">
                      <AssetIcon type={asset.asset_type} size={16} />
                      <span>{asset.asset_type}</span>
                    </span>
                  </td>
                  <td>
                    <div className="fw-semibold">{asset.brand} {asset.model}</div>
                    {asset.serial_number && (
                      <span className="text-muted small font-monospace" style={{ fontSize: '0.72rem' }}>
                        SN: {asset.serial_number}
                      </span>
                    )}
                  </td>
                  <td className="small">{asset.department_name || `Dept #${asset.department_id}`}</td>
                  <td>
                    <StatusBadge status={asset.status} />
                  </td>
                  <td className="small">
                    {asset.assigned_user_name ? (
                      <span className="fw-medium text-body">{asset.assigned_user_name}</span>
                    ) : (
                      <span className="text-muted fst-italic">Unassigned</span>
                    )}
                  </td>
                  <td className="text-end">
                    <Link to={`/assets/${asset.id}`} className="btn btn-sm btn-outline-primary py-1 px-2">
                      Details
                    </Link>
                  </td>
                </tr>
              ))}

              {!loading && assets.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    <p className="text-muted mb-2">No hardware assets found matching your criteria.</p>
                    {hasFilters && (
                      <button className="btn btn-sm btn-outline-secondary" onClick={resetFilters}>
                        Clear filters
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
              {Math.min(currentPage * itemsPerPage, assets.length)} of {assets.length}
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

      {/* Modal: Register New Asset */}
      {showModal && (
        <div className="modal-backdrop-custom">
          <div className="modal-content-custom p-4">
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <h2 className="h5 fw-bold mb-0">Register Hardware Asset</h2>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary p-1"
                onClick={() => setShowModal(false)}
              >
                <X size={16} />
              </button>
            </div>

            {modalError && <div className="alert alert-danger py-2 small mb-3">{modalError}</div>}

            <form onSubmit={handleCreateAsset} className="d-flex flex-column gap-3">
              <div className="row g-3">
                <div className="col-12 col-sm-6">
                  <label className="form-label small fw-semibold mb-1" htmlFor="asset-type-input">
                    Asset Type <span className="text-danger">*</span>
                  </label>
                  <select
                    id="asset-type-input"
                    className="form-select"
                    value={newAssetForm.asset_type}
                    onChange={(e) => setNewAssetForm({ ...newAssetForm, asset_type: e.target.value })}
                  >
                    <option value="Laptop">Laptop</option>
                    <option value="Desktop">Desktop</option>
                    <option value="Monitor">Monitor</option>
                    <option value="Printer">Printer</option>
                    <option value="Router">Router</option>
                    <option value="Switch">Switch</option>
                    <option value="Mobile Device">Mobile Device</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="col-12 col-sm-6">
                  <label className="form-label small fw-semibold mb-1" htmlFor="asset-dept-input">
                    Department <span className="text-danger">*</span>
                  </label>
                  <select
                    id="asset-dept-input"
                    className="form-select"
                    value={newAssetForm.department_id}
                    onChange={(e) => setNewAssetForm({ ...newAssetForm, department_id: e.target.value })}
                    required
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-12 col-sm-6">
                  <label className="form-label small fw-semibold mb-1" htmlFor="asset-brand-input">
                    Manufacturer / Brand <span className="text-danger">*</span>
                  </label>
                  <input
                    id="asset-brand-input"
                    className="form-control"
                    placeholder="e.g. Dell, Apple, HP, Cisco"
                    value={newAssetForm.brand}
                    onChange={(e) => setNewAssetForm({ ...newAssetForm, brand: e.target.value })}
                    required
                  />
                </div>

                <div className="col-12 col-sm-6">
                  <label className="form-label small fw-semibold mb-1" htmlFor="asset-model-input">
                    Model Designation <span className="text-danger">*</span>
                  </label>
                  <input
                    id="asset-model-input"
                    className="form-control"
                    placeholder="e.g. Latitude 5520, MacBook Pro 16"
                    value={newAssetForm.model}
                    onChange={(e) => setNewAssetForm({ ...newAssetForm, model: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="row g-3">
                <div className="col-12 col-sm-6">
                  <label className="form-label small fw-semibold mb-1" htmlFor="asset-sn-input">
                    Serial Number
                  </label>
                  <input
                    id="asset-sn-input"
                    className="form-control"
                    placeholder="e.g. SN-89421-B"
                    value={newAssetForm.serial_number}
                    onChange={(e) => setNewAssetForm({ ...newAssetForm, serial_number: e.target.value })}
                  />
                </div>

                <div className="col-12 col-sm-6">
                  <label className="form-label small fw-semibold mb-1" htmlFor="asset-status-input">
                    Status
                  </label>
                  <select
                    id="asset-status-input"
                    className="form-select"
                    value={newAssetForm.status}
                    onChange={(e) => setNewAssetForm({ ...newAssetForm, status: e.target.value })}
                  >
                    <option value="Available">Available</option>
                    <option value="Under Repair">Under Repair</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-12 col-sm-6">
                  <label className="form-label small fw-semibold mb-1" htmlFor="asset-purchased-input">
                    Purchase Date
                  </label>
                  <input
                    id="asset-purchased-input"
                    type="date"
                    className="form-control"
                    value={newAssetForm.purchase_date}
                    onChange={(e) => setNewAssetForm({ ...newAssetForm, purchase_date: e.target.value })}
                  />
                </div>

                <div className="col-12 col-sm-6">
                  <label className="form-label small fw-semibold mb-1" htmlFor="asset-warranty-input">
                    Warranty Expiry Date
                  </label>
                  <input
                    id="asset-warranty-input"
                    type="date"
                    className="form-control"
                    value={newAssetForm.warranty_expiry}
                    onChange={(e) => setNewAssetForm({ ...newAssetForm, warranty_expiry: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="form-label small fw-semibold mb-1" htmlFor="asset-notes-input">
                  Internal Notes
                </label>
                <textarea
                  id="asset-notes-input"
                  className="form-control"
                  rows="2"
                  placeholder="e.g. Purchased under FY26 infrastructure batch..."
                  value={newAssetForm.notes}
                  onChange={(e) => setNewAssetForm({ ...newAssetForm, notes: e.target.value })}
                />
              </div>

              <div className="d-flex justify-content-end gap-2 pt-3 border-top mt-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={modalSaving}
                >
                  {modalSaving ? 'Registering...' : 'Register Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
