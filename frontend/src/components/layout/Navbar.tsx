import { Link, NavLink } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'

const links = [
  { to: '/',          label: 'Экосистема' },
  { to: '/master',    label: 'Мастер-карта' },
  { to: '/alerts',    label: '🚨 Алерты' },
  { to: '/kaizen',    label: '💡 Кайдзен' },
  { to: '/dashboard', label: 'Дашборд' },
  { to: '/report',    label: 'Отчёт' },
]

export default function Navbar() {
  const { user, logout } = useAuthStore()

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-gray-900/80 backdrop-blur border-b border-gray-800">
      <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2 font-bold text-svep-accent shrink-0">
          <span className="text-xl">⚡</span>
          <span className="hidden sm:block">СВЭП</span>
        </Link>

        <div className="flex gap-1 flex-1 overflow-x-auto">
          {links.map(l => (
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

        <div className="shrink-0 flex items-center gap-3">
          {user ? (
            <>
              <Link to="/profile" className="text-xs text-gray-400 hidden md:block hover:text-white transition-colors">{user.name}</Link>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-900 text-blue-300">{user.role}</span>
              <button onClick={logout} className="text-xs text-gray-500 hover:text-red-400">Выйти</button>
            </>
          ) : (
            <Link to="/login" className="text-sm text-gray-400 hover:text-white">Войти</Link>
          )}
        </div>
      </div>
    </nav>
  )
}
