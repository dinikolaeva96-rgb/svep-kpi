import { useLocation } from 'react-router-dom'

const PAGE_LABELS: Record<string, string> = {
  '/':          'Экосистема',
  '/master':    'Мастер-карта',
  '/dashboard': 'Дашборд',
  '/alerts':    'Сигналы',
  '/kaizen':    'Кайдзен',
  '/report':    'Отчёт',
  '/admin':     'Администрирование',
  '/profile':   'Профиль',
}

export default function Topbar({ collapsed, dark = false }: { collapsed: boolean; dark?: boolean }) {
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
        background: dark
          ? 'rgba(6,10,20,0.75)'
          : 'rgba(240,245,251,0.88)',
        WebkitBackdropFilter: 'blur(20px)',
        backdropFilter: 'blur(20px)',
        borderBottom: dark
          ? '1px solid rgba(255,255,255,0.05)'
          : '1px solid rgba(28,132,198,0.1)',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 24,
        paddingRight: 24,
        transition: 'left 0.22s cubic-bezier(0.4,0,0.2,1), background 0.4s ease, border-color 0.4s ease',
      }}
    >
      <span style={{
        fontSize: 14,
        fontWeight: 600,
        color: dark ? 'rgba(255,255,255,0.55)' : '#0D1B2A',
        fontFamily: "'Exo 2', sans-serif",
        letterSpacing: '0.02em',
        transition: 'color 0.4s ease',
      }}>
        {label}
      </span>
    </div>
  )
}
