import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { UserCheck, UserX } from 'lucide-react'
import { apiRequest } from '../services/api'
import UserAvatar from '../components/UserAvatar'

const roles = ['EMPLOYEE', 'IT_SUPPORT', 'IT_MANAGER']

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState(null)

  const loadUsers = () => apiRequest('/api/users').then((data) => setUsers(data.users))

  useEffect(() => {
    loadUsers().catch((loadError) => setError(loadError.message))
  }, [])

  const updateUser = async (user, changes) => {
    setSavingId(user.id)
    setError('')
    try {
      await apiRequest(`/api/users/${user.id}`, {
        method: 'PATCH',
        body: JSON.stringify(changes),
      })
      await loadUsers()
    } catch (updateError) {
      setError(updateError.message)
    } finally {
      setSavingId(null)
    }
  }

  return (
    <main className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <p className="text-muted mb-1">Manager view</p>
          <h1 className="h2 mb-0">User administration</h1>
        </div>
        <Link className="btn btn-outline-secondary" to="/">Back to overview</Link>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="table-responsive card">
        <table className="table table-hover mb-0 align-middle">
          <thead><tr><th>User</th><th>Employee ID</th><th>Role</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td><span className="user-table-identity"><UserAvatar user={user} /><span><strong>{user.name}</strong><small className="d-block text-muted">{user.email}</small></span></span></td>
                <td>{user.employee_id}</td>
                <td>
                  <select className="form-select form-select-sm" value={user.role} disabled={savingId === user.id} onChange={(event) => updateUser(user, { role: event.target.value })}>
                    {roles.map((role) => <option key={role}>{role}</option>)}
                  </select>
                </td>
                <td>{user.is_active ? 'Active' : 'Inactive'}</td>
                <td><button className="btn btn-sm btn-outline-secondary icon-button" disabled={savingId === user.id} onClick={() => updateUser(user, { is_active: !user.is_active })}>{user.is_active ? <><UserX size={15} /> Deactivate</> : <><UserCheck size={15} /> Activate</>}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
