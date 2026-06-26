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
        background: '#FFFFFF',
        borderBottom: '1px solid #E8EAF0',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 24,
        paddingRight: 24,
        transition: 'left 0.22s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      <span style={{
        fontSize: 15,
        fontWeight: 600,
        color: '#0D1B2A',
        fontFamily: "'Exo 2', sans-serif",
      }}>
        {label}
      </span>
    </div>
  )
}
