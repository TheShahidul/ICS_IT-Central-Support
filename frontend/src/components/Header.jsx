import { Bell, LogOut } from 'lucide-react'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import UserAvatar from './UserAvatar'
import ThemeSwitcher from './ThemeSwitcher'

export default function Header({ user }) {
  const { handleLogout } = useContext(AuthContext)

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    handleLogout()
  }

  return (
    <header className="app-header">
      <div>
        <span className="app-eyebrow">Internal operations</span>
        <strong><img className="header-logo" src="/branding/ics-logo.png" alt="ICS - IT Central Support" /></strong>
      </div>
      <div className="user-chip">
        <ThemeSwitcher />
        <Bell size={17} aria-label="Notifications" />
        <UserAvatar user={user} />
        <span className="user-summary"><strong>{user?.name}</strong><small>{user?.role}</small></span>
        <button className="btn btn-sm btn-outline-secondary icon-button logout-button" type="button" onClick={logout} title="Sign out">
          <LogOut size={15} aria-hidden="true" />
          <span>Sign out</span>
        </button>
      </div>
    </header>
  )
}