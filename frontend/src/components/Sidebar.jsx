import { NavLink } from 'react-router-dom'
import { ClipboardList, FileClock, LayoutDashboard, Package, Users } from 'lucide-react'

const links = [
	{ to: '/', label: 'Overview', end: true, icon: LayoutDashboard },
	{ to: '/tickets', label: 'Tickets', icon: ClipboardList },
	{ to: '/assets', label: 'Assets', icon: Package },
]

export default function Sidebar({ role }) {
	const visibleLinks = role === 'IT_MANAGER'
		? [...links, { to: '/audit', label: 'Audit activity', icon: FileClock }, { to: '/users', label: 'Users', icon: Users }]
		: links

	return (
		<aside className="app-sidebar">
			<div className="brand-mark" aria-label="ICS - IT Central Support">
				<div className="brand-logo-badge">
					<img src="/branding/ICS_icon-textbased.png" alt="ICS" />
				</div>
			</div>
			<p className="sidebar-caption">Workspace</p>
			<nav className="sidebar-nav" aria-label="Primary navigation">
				{visibleLinks.map((link) => (
					<NavLink
						key={link.to}
						to={link.to}
						end={link.end}
						className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}
					>
						<link.icon size={17} aria-hidden="true" />
						{link.label}
					</NavLink>
				))}
			</nav>
			<div className="sidebar-footer">
				<span>Signed in role</span>
				<strong>{role}</strong>
			</div>
		</aside>
	)
}
