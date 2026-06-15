import { Link, NavLink } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import LogoMark from '@/assets/logo-mark.svg?react'

const ROLE_LEVELS: Record<string, number> = { public: 0, dept_head: 1, management: 2, admin: 3 }

const links = [
  { to: '/',          label: 'Экосистема',   minRole: 0 },
  { to: '/master',    label: 'Мастер-карта', minRole: 0 },
  { to: '/alerts',    label: 'Алерты',       minRole: 0 },
  { to: '/kaizen',    label: 'Кайдзен',      minRole: 0 },
  { to: '/dashboard', label: 'Дашборд',      minRole: 0 },
  { to: '/report',    label: 'Отчёт',        minRole: 0 },
]

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const roleLevel = user ? (ROLE_LEVELS[user.role] ?? 0) : 0

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-svep-surface/95 backdrop-blur border-b border-svep-border">
      <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center gap-5">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 text-svep-primary hover:text-svep-accent transition-colors">
          <LogoMark className="w-5 h-5" style={{ color: 'var(--accent)' }} />
          <span className="font-brutal font-black tracking-[.18em] text-sm">СВЭП</span>
        </Link>

        {/* Nav links */}
        <div className="flex gap-0 flex-1 overflow-x-auto">
          {links.filter(l => roleLevel >= l.minRole).map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `px-3 py-1 text-xs uppercase tracking-[.12em] font-medium transition-colors whitespace-nowrap relative ${
                  isActive
                    ? 'text-svep-accent after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[1px] after:bg-svep-accent'
                    : 'text-svep-secondary hover:text-svep-primary'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        {/* Auth */}
        <div className="shrink-0 flex items-center gap-2">
          {user ? (
            <>
              {roleLevel >= 1 && (
                <NavLink to="/admin"
                  className={({ isActive }) =>
                    `text-xs px-2.5 py-1 rounded border transition-colors ${
                      isActive
                        ? 'bg-svep-accent text-white border-svep-accent'
                        : 'text-svep-secondary border-svep-border hover:border-svep-accent hover:text-svep-accent'
                    }`
                  }>
                  Админ
                </NavLink>
              )}
              <span className="text-xs text-svep-secondary hidden lg:block truncate max-w-[100px]">
                {user.name.split(' ')[0]}
              </span>
              <span className="eyebrow text-svep-accent bg-svep-accent-light px-2 py-0.5 rounded">
                {user.role}
              </span>
              <button onClick={logout} className="text-svep-tertiary hover:text-red-500 transition-colors text-xs">
                ✕
              </button>
            </>
          ) : (
            <Link to="/login"
              className="text-xs px-3 py-1.5 border border-svep-border rounded text-svep-secondary hover:border-svep-accent hover:text-svep-accent transition-colors">
              Войти
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
