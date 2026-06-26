import { useLocation } from 'react-router-dom'

const PAGE_LABELS: Record<string, string> = {
  '/':          'Экосистема',
  '/master':    'Мастер-карта',
  '/dashboard': 'Дашборд',
  '/alerts':    'Алерты',
  '/kaizen':    'Кайдзен',
  '/report':    'Отчёт',
  '/admin':     'Администрирование',
  '/profile':   'Профиль',
}

export default function Topbar({ collapsed }: { collapsed: boolean }) {
  const { pathname } = useLocation()

  const label = PAGE_LABELS[pathname]
    ?? (pathname.startsWith('/dept/') ? 'Карта отдела'
    : pathname.startsWith('/domain/') ? 'Домен'
    : '')

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: collapsed ? 64 : 240,
        right: 0,
        height: 52,
        zIndex: 30,
        background: 'rgba(10,22,40,0.7)',
        WebkitBackdropFilter: 'blur(20px)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 24,
        paddingRight: 24,
        transition: 'left 0.22s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      <span style={{
        fontSize: 14,
        fontWeight: 600,
        color: 'rgba(255,255,255,0.8)',
        fontFamily: "'Exo 2', sans-serif",
        letterSpacing: '0.02em',
      }}>
        {label}
      </span>
    </div>
  )
}
