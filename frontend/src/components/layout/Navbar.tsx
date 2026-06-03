import { Link, NavLink } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'

const ROLE_LEVELS: Record<string, number> = { public: 0, dept_head: 1, management: 2, admin: 3 }

const links = [
  { to: '/',          label: 'Экосистема',  minRole: 0 },
  { to: '/master',    label: 'Мастер-карта',minRole: 0 },
  { to: '/alerts',    label: '🚨 Алерты',   minRole: 0 },
  { to: '/kaizen',    label: '💡 Кайдзен',  minRole: 0 },
  { to: '/dashboard', label: 'Дашборд',     minRole: 0 },
  { to: '/report',    label: 'Отчёт',       minRole: 0 },
]

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const roleLevel = user ? (ROLE_LEVELS[user.role] ?? 0) : 0

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-gray-900/80 backdrop-blur border-b border-gray-800">
      <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-amber-400 shrink-0">
          <span className="text-xl">⚡</span>
          <span className="hidden sm:block text-sm">СВЭП</span>
        </Link>

        <div className="flex gap-0.5 flex-1 overflow-x-auto">
          {links.filter(l => roleLevel >= l.minRole).map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="shrink-0 flex items-center gap-2">
          {user ? (
            <>
              {/* Ссылка на admin — только для privileged ролей */}
              {roleLevel >= 1 && (
                <NavLink to="/admin"
                  className={({ isActive }) =>
                    `text-xs px-2.5 py-1 rounded transition-colors ${isActive ? 'bg-purple-600 text-white' : 'text-purple-400 hover:text-white bg-purple-900/20 border border-purple-700/40'}`
                  }>
                  ⚙️ Админ
                </NavLink>
              )}
              <Link to="/profile" className="text-xs text-gray-400 hidden lg:block hover:text-white transition-colors truncate max-w-[100px]">
                {user.name.split(' ')[0]}
              </Link>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-900/50 text-blue-300 border border-blue-700/40">
                {user.role}
              </span>
              <button onClick={logout} className="text-xs text-gray-600 hover:text-red-400 transition-colors">
                ✕
              </button>
            </>
          ) : (
            <Link to="/login" className="text-sm text-gray-400 hover:text-white">Войти</Link>
          )}
        </div>
      </div>
    </nav>
  )
}
