import { Link, NavLink } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import GeometricMotif from '@/components/GeometricMotif'

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
    <nav
      className="fixed top-0 inset-x-0 z-50"
      style={{ background: 'var(--navy)', borderBottom: '1px solid var(--navy-border)', height: 64 }}
    >
      <div className="max-w-screen-xl mx-auto px-6 h-full flex items-center gap-5">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 text-white hover:opacity-90 transition-opacity">
          <GeometricMotif variant="header" />
          <span className="font-brutal font-black tracking-[.18em]" style={{ fontSize: 14, letterSpacing: '0.02em' }}>СВЭП</span>
        </Link>

        {/* Nav links */}
        <div className="flex gap-0 flex-1 overflow-x-auto">
          {links.filter(l => roleLevel >= l.minRole).map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `px-3 py-1 font-medium whitespace-nowrap relative transition-all ${
                  isActive
                    ? 'text-white after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[2px] after:bg-svep-accent'
                    : 'text-white/85 hover:text-white after:absolute after:bottom-0 after:left-3 after:right-3 after:h-px after:bg-svep-accent after:opacity-0 hover:after:opacity-100'
                }`
              }
              style={{ fontFamily: "'BrutalType', sans-serif", fontSize: 14, letterSpacing: '0.02em' }}
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
                    `text-xs px-2.5 py-1 rounded-[6px] border transition-colors ${
                      isActive
                        ? 'bg-svep-accent text-white border-svep-accent'
                        : 'text-white/85 border-white/15 hover:border-svep-accent hover:text-white'
                    }`
                  }>
                  Админ
                </NavLink>
              )}
              <span className="text-xs text-white/65 hidden lg:block truncate max-w-[100px]">
                {user.name.split(' ')[0]}
              </span>
              <span
                className="text-xs px-2.5 py-1 rounded-[6px] text-white font-medium"
                style={{ background: 'var(--accent)' }}
              >
                {user.role}
              </span>
              <button onClick={logout} className="text-white/60 hover:text-red-400 transition-colors text-xs">
                ✕
              </button>
            </>
          ) : (
            <Link to="/login"
              className="text-xs px-3 py-1.5 rounded-[6px] text-white font-medium transition-colors"
              style={{ background: 'var(--accent)' }}>
              Войти
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
