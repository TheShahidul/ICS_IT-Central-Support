import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import Header from './Header'
import Sidebar from './Sidebar'

export default function AppShell({ children }) {
  const { user } = useContext(AuthContext)
  const theme = user?.role === 'IT_MANAGER' ? 'theme-manager' : user?.role === 'IT_SUPPORT' ? 'theme-support' : 'theme-employee'

  return (
    <div className={`app-shell ${theme}`}>
      <Sidebar role={user?.role} />
      <div className="app-workspace">
        <Header user={user} />
        <div className="app-content">{children}</div>
      </div>
    </div>
  )
}