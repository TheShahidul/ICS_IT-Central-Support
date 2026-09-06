import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../services/api'

export default function AuditLogs() {
  const [logs, setLogs] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    apiRequest('/api/audit/logs')
      .then((data) => setLogs(data.logs))
      .catch((loadError) => setError(loadError.message))
  }, [])

  return (
    <main className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <p className="text-muted mb-1">Manager view</p>
          <h1 className="h2 mb-0">Audit activity</h1>
        </div>
        <Link className="btn btn-outline-secondary" to="/">Back to overview</Link>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      {!error && logs.length === 0 && <div className="card card-body text-muted">No audit activity recorded yet.</div>}
      {logs.length > 0 && <div className="table-responsive card">
        <table className="table table-hover mb-0">
          <thead><tr><th>Time</th><th>Action</th><th>Entity</th><th>Actor</th><th>Details</th></tr></thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{new Date(log.created_at).toLocaleString()}</td>
                <td><code>{log.action}</code></td>
                <td>{log.entity_type} #{log.entity_id}</td>
                <td>User #{log.actor_id}</td>
                <td><small>{JSON.stringify(log.details)}</small></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>}
    </main>
  )
}
