import { useContext, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { Eye, EyeOff, LogIn } from 'lucide-react'

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

	const submit = async (event) => {
		event.preventDefault()
		setError('')
		setLoading(true)

		try {
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ email, password }),
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

	return (
		<main className="container py-5">
			<div className="row justify-content-center">
				<div className="col-12 col-md-6 col-lg-4">
					<img className="login-logo mb-4" src="/branding/ics-logo.png" alt="ICS - IT Central Support" />
					<form onSubmit={submit} className="card card-body gap-3">
						<label className="form-label mb-0" htmlFor="email">Login username</label>
						<input
							id="email"
							className="form-control"
							type="email"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							required
						/>
						<label className="form-label mb-0" htmlFor="password">Password</label>
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
						{error && <div className="alert alert-danger mb-0">{error}</div>}
						<button className="btn btn-primary icon-button" type="submit" disabled={loading}>
							<LogIn size={16} aria-hidden="true" />
							{loading ? 'Signing in...' : 'Sign in'}
						</button>
					</form>
				</div>
			</div>
		</main>
	)
}
