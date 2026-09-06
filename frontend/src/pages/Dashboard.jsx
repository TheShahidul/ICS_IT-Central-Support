import { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { ArrowRight, ClipboardList, Package, LogOut } from 'lucide-react'
import UserAvatar from '../components/UserAvatar'

export default function Dashboard() {
  const { user, handleLogout } = useContext(AuthContext)
  const [summary, setSummary] = useState(null)
  const [summaryError, setSummaryError] = useState('')

  useEffect(() => {
    fetch('/api/dashboard/summary', { credentials: 'include' })
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Unable to load dashboard')
        setSummary(data)
      })
      .catch((error) => setSummaryError(error.message))
  }, [])

  const logout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })
    handleLogout()
  }

  return (
    <main className="container py-4">
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <p className="text-muted mb-1">ICS - IT Central Support</p>
          <h1 className="h2">Welcome, {user?.name}</h1>
          <p className="mb-0">You are signed in as {user?.role}.</p>
        </div>
        <button className="btn btn-outline-secondary icon-button" type="button" onClick={logout}>
          <LogOut size={16} aria-hidden="true" /> Sign out
        </button>
      </div>

      <div className="row g-4">
        <div className="col-12 col-md-4">
          <section className="card h-100">
            <div className="card-body">
              <div className="account-heading"><UserAvatar user={user} size="lg" /><h2 className="h5 mb-0">Your account</h2></div>
              <dl className="mb-0">
                <dt>Name</dt>
                <dd>{user?.name}</dd>
                <dt>Email</dt>
                <dd>{user?.email}</dd>
                <dt>Role</dt>
                <dd>{user?.role}</dd>
              </dl>
            </div>
          </section>
        </div>

        <div className="col-12 col-md-8">
          <section className="card h-100">
            <div className="card-body">
              <h2 className="h5">Application status</h2>
              <p className="text-muted">
                Authentication is active. Use the workspace navigation to manage tickets and review assigned assets.
              </p>
              <div className="d-flex gap-2 flex-wrap">
                <Link className="btn btn-primary icon-button" to="/tickets"><ClipboardList size={16} /> View tickets <ArrowRight size={15} /></Link>
                <Link className="btn btn-outline-primary icon-button" to="/assets"><Package size={16} /> View assets <ArrowRight size={15} /></Link>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="row g-4 mt-1">
        <div className="col-12 col-md-6">
          <section className="card h-100">
            <div className="card-body">
              <h2 className="h5">Ticket summary</h2>
              {summaryError && <div className="alert alert-warning">{summaryError}</div>}
              {!summary && !summaryError && <p className="text-muted">Loading metrics...</p>}
              {summary && <>
                <p className="display-6 mb-3">{summary.tickets.total}</p>
                <div className="d-flex gap-2 flex-wrap">
                  {Object.entries(summary.tickets.by_status).map(([label, count]) => <span className="badge text-bg-light" key={label}>{label}: {count}</span>)}
                </div>
              </>}
            </div>
          </section>
        </div>
        <div className="col-12 col-md-6">
          <section className="card h-100">
            <div className="card-body">
              <h2 className="h5">Asset summary</h2>
              {summary && <>
                <p className="display-6 mb-3">{summary.assets.total}</p>
                <div className="d-flex gap-2 flex-wrap">
                  {Object.entries(summary.assets.by_status).map(([label, count]) => <span className="badge text-bg-light" key={label}>{label}: {count}</span>)}
                </div>
              </>}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
