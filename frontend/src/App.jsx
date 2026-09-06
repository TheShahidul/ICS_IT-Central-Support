import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthContext } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import './App.css'

// Pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Tickets from './pages/Tickets'
import NewTicket from './pages/NewTicket'
import TicketDetail from './pages/TicketDetail'
import Assets from './pages/Assets'
import AssetDetail from './pages/AssetDetail'
import AuditLogs from './pages/AuditLogs'
import UserManagement from './pages/UserManagement'
import NotFound from './pages/NotFound'

// Components
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated on app load
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    setUser(null)
  }

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>Loading...</div>
  }

  return (
    <ThemeProvider>
      <AuthContext.Provider value={{ user, handleLogin, handleLogout, checkAuth }}>
        <BrowserRouter>
          <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/tickets" element={<ProtectedRoute><Tickets /></ProtectedRoute>} />
          <Route path="/tickets/new" element={<ProtectedRoute><NewTicket /></ProtectedRoute>} />
          <Route path="/tickets/:id" element={<ProtectedRoute><TicketDetail /></ProtectedRoute>} />
          <Route path="/assets" element={<ProtectedRoute><Assets /></ProtectedRoute>} />
          <Route path="/assets/:id" element={<ProtectedRoute><AssetDetail /></ProtectedRoute>} />
          <Route path="/audit" element={<ProtectedRoute><AuditLogs /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthContext.Provider>
    </ThemeProvider>
  )
}

export default App
