import { Link, NavLink } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import GeometricMotif from '@/components/GeometricMotif'

const ROLE_LEVELS: Record<string, number> = { public: 0, dept_head: 1, management: 2, admin: 3 }

const links = [
  { to: '/',          label: 'Экосистема',   minRole: 0 },
  { to: '/master',    label: 'Мастер-карта', minRole: 0 },
  { to: '/alerts',    label: 'Сигналы',       minRole: 0 },
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
        {/* Logo — symbol + abbreviation, divider line, like LOGO-without_descriptor */}
        <Link to="/" className="flex items-center gap-3 shrink-0 text-white hover:opacity-90 transition-opacity">
          <GeometricMotif variant="header" color="#2196C9" />
          <span style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.2)' }} />
          <span className="font-display font-bold tracking-[.1em]" style={{ fontSize: 15 }}>СВЭП</span>
        </Link>

        {/* Nav links */}
        <div className="flex gap-0 flex-1 overflow-x-auto">
          {links.filter(l => roleLevel >= l.minRole).map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `px-3 py-1 font-medium whitespace-nowrap relative transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'text-white after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[2px] after:bg-svep-accent'
                    : 'text-[#8FA3B8] hover:text-white after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[2px] after:bg-svep-accent after:opacity-0 hover:after:opacity-100 after:transition-opacity'
                }`
              }
              style={{ fontFamily: "'Inter', sans-serif", fontSize: 14 }}
            >
              {({ isActive }) => (
                <>
                  {isActive && <GeometricMotif variant="header" color="#2196C9" size={14} />}
                  {l.label}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Auth */}
        <div className="shrink-0 flex items-center gap-3">
          {user ? (
            <>
              {roleLevel >= 1 && (
                <NavLink to="/admin"
                  className={({ isActive }) =>
                    `text-xs px-2.5 py-1 rounded-[6px] border transition-colors ${
                      isActive
                        ? 'bg-svep-accent text-white border-svep-accent'
                        : 'text-[#8FA3B8] border-white/15 hover:border-svep-accent hover:text-white'
                    }`
                  }>
                  Админ
                </NavLink>
              )}
              <div className="hidden lg:flex flex-col items-end leading-tight">
                <span className="text-white font-semibold text-sm">{user.name.split(' ')[0]}</span>
                <span className="text-[#8FA3B8] text-xs">{user.role}</span>
              </div>
              <button onClick={logout} className="text-[#8FA3B8] hover:text-[#EB5757] transition-colors text-base px-1">
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
