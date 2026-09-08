import { useContext, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { Eye, EyeOff, LogIn, Shield, User, Wrench } from 'lucide-react'

const DEMO_PERSONAS = [
	{
		role: 'EMPLOYEE',
		name: 'Alice Johnson',
		dept: 'Finance',
		email: 'user_id1.finance@company.com',
		password: 'user_id1',
		icon: User,
		badgeClass: 'bg-primary-subtle text-primary border border-primary-subtle',
		description: 'Create & track personal IT tickets and assigned hardware',
	},
	{
		role: 'IT_SUPPORT',
		name: 'Bob Smith',
		dept: 'IT Support',
		email: 'user_id1.ics@company.com',
		password: 'user_id1',
		icon: Wrench,
		badgeClass: 'bg-success-subtle text-success border border-success-subtle',
		description: 'Manage tickets, assign technicians, update asset status',
	},
	{
		role: 'IT_MANAGER',
		name: 'Carol Williams',
		dept: 'IT Management',
		email: 'user_id2.ics@company.com',
		password: 'user_id2',
		icon: Shield,
		badgeClass: 'bg-warning-subtle text-warning-emphasis border border-warning-subtle',
		description: 'Full administrative access, audit logs, and user management',
	},
]

export default function Login() {
	const { user, handleLogin } = useContext(AuthContext)
	const navigate = useNavigate()
	const [email, setEmail] = useState('user_id1.finance@company.com')
	const [password, setPassword] = useState('user_id1')
	const [showPassword, setShowPassword] = useState(false)
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)

	if (user) {
		return <Navigate to="/" replace />
	}

	const loginWithDemoRole = async (role) => {
		setError('')
		setLoading(true)

		try {
			const response = await fetch('/api/auth/demo-login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ role }),
			})
			const data = await response.json()

			if (!response.ok) {
				setError(data.error || 'Unable to sign in')
				return
			}

			handleLogin(data.user)
			navigate('/')
		} catch {
			setError('Unable to connect to the backend')
		} finally {
			setLoading(false)
		}
	}

	const submit = (event) => {
		event.preventDefault()
		loginWithCredentials(email, password)
	}

	const selectPersona = (persona) => {
		setEmail(persona.email)
		setPassword(persona.password)
		loginWithDemoRole(persona.role)
	}

	return (
		<main className="container py-5">
			<div className="row justify-content-center">
				<div className="col-12 col-md-7 col-lg-5">
					<div className="text-center mb-4">
						<img className="login-logo mb-3" src="/branding/ICS_icon-textbased.png" alt="ICS - IT Central Support" />
						<h1 className="h4 fw-bold mb-1">IT Operations &amp; Asset Portal</h1>
						<p className="text-muted small">Financial Services Simulated IT Infrastructure</p>
					</div>

					{/* Instant 1-Click Guest Preview Banner */}
					<div className="alert alert-info py-2 px-3 mb-3 d-flex flex-column gap-2 border-0 shadow-sm" style={{ background: 'rgba(33, 150, 243, 0.08)' }}>
						<div className="d-flex align-items-center justify-content-between">
							<span className="fw-bold small text-primary">⚡ Instant Guest Access</span>
							<span className="badge bg-primary text-white small" style={{ fontSize: '0.65rem' }}>No Login Required</span>
						</div>
						<div className="d-flex gap-1 flex-wrap">
							<button
								type="button"
								className="btn btn-sm btn-outline-primary py-1 px-2 small flex-grow-1"
								onClick={() => loginWithDemoRole('EMPLOYEE')}
								disabled={loading}
							>
								👤 Employee
							</button>
							<button
								type="button"
								className="btn btn-sm btn-outline-success py-1 px-2 small flex-grow-1"
								onClick={() => loginWithDemoRole('IT_SUPPORT')}
								disabled={loading}
							>
								🛠️ IT Support
							</button>
							<button
								type="button"
								className="btn btn-sm btn-outline-warning py-1 px-2 small flex-grow-1 text-dark"
								onClick={() => loginWithDemoRole('IT_MANAGER')}
								disabled={loading}
							>
								🛡️ Manager
							</button>
						</div>
					</div>

					<form onSubmit={submit} className="card card-body gap-3 shadow-sm mb-4">
						<div>
							<label className="form-label mb-1 fw-semibold small" htmlFor="email">Email address</label>
							<input
								id="email"
								className="form-control"
								type="email"
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								placeholder="e.g. user_id1.finance@company.com"
								required
							/>
						</div>

						<div>
							<label className="form-label mb-1 fw-semibold small" htmlFor="password">Password</label>
							<div className="input-group">
								<input
									id="password"
									className="form-control"
									type={showPassword ? 'text' : 'password'}
									value={password}
									onChange={(event) => setPassword(event.target.value)}
									required
								/>
								<button
									className="btn btn-outline-secondary"
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									aria-label={showPassword ? 'Hide password' : 'Show password'}
								>
									{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
								</button>
							</div>
						</div>

						{error && <div className="alert alert-danger py-2 small mb-0">{error}</div>}

						<button className="btn btn-primary icon-button w-100 justify-content-center py-2" type="submit" disabled={loading}>
							<LogIn size={16} aria-hidden="true" />
							<span>{loading ? 'Signing in...' : 'Sign in'}</span>
						</button>
					</form>

					{/* 1-Click Demo Persona Access */}
					<div className="card card-body shadow-sm">
						<div className="d-flex align-items-center justify-content-between mb-3">
							<span className="fw-semibold small text-uppercase letter-spacing-1 text-muted">1-Click Demo Personas</span>
							<span className="badge text-bg-light border small">Select to auto-login</span>
						</div>

						<div className="d-flex flex-column gap-2">
							{DEMO_PERSONAS.map((persona) => {
								const Icon = persona.icon
								return (
									<button
										key={persona.role}
										type="button"
										className="persona-card d-flex align-items-start gap-3 w-100 text-start"
										onClick={() => selectPersona(persona)}
										disabled={loading}
									>
										<div className="mt-1 p-2 rounded-2 bg-light text-dark">
											<Icon size={18} />
										</div>
										<div className="flex-grow-1">
											<div className="d-flex align-items-center gap-2 mb-1">
												<strong className="small">{persona.name}</strong>
												<span className={`badge ${persona.badgeClass}`} style={{ fontSize: '0.65rem' }}>
													{persona.role}
												</span>
											</div>
											<div className="text-muted small" style={{ fontSize: '0.75rem', lineHeight: '1.25' }}>
												{persona.description}
											</div>
										</div>
									</button>
								)
							})}
						</div>
					</div>
				</div>
			</div>
		</main>
	)
}
