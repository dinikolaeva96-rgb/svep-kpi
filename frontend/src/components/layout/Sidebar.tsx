import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import GeometricMotif from '@/components/GeometricMotif'

/* ---- icons ---- */
function Icon({ d, size = 18 }: { d: string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none"
      stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}

const ICONS: Record<string, string> = {
  home:      'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
  map:       'M1 6l7-3 8 3 7-3v15l-7 3-8-3-7 3V6z M8 3v15 M16 6v15',
  chart:     'M18 20V10 M12 20V4 M6 20v-6',
  bell:      'M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0',
  zap:       'M13 2 3 14h9l-1 8 10-12h-9l1-8z',
  file:      'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
  logout:    'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9',
  chevronL:  'M15 18l-6-6 6-6',
  chevronR:  'M9 18l6-6-6-6',
  user:      'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
}

const NAV_MAIN = [
  { to: '/',         label: 'Экосистема',  icon: 'home'  },
  { to: '/master',   label: 'Мастер-карта',icon: 'map'   },
  { to: '/dashboard',label: 'Дашборд',     icon: 'chart' },
]

const NAV_WORK = [
  { to: '/alerts',   label: 'Алерты',      icon: 'bell'  },
  { to: '/kaizen',   label: 'Кайдзен',     icon: 'zap'   },
  { to: '/report',   label: 'Отчёт',       icon: 'file'  },
]

const ROLE_LABELS: Record<string, string> = {
  admin:      'Администратор',
  management: 'Руководство',
  dept_head:  'Начальник отдела',
  public:     'Просмотр',
}

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  alertCount: number
}

export default function Sidebar({ collapsed, onToggle, alertCount }: SidebarProps) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const W = collapsed ? 64 : 240

  function NavItem({ to, label, icon, badge }: { to: string; label: string; icon: string; badge?: number }) {
    return (
      <NavLink
        to={to}
        end={to === '/'}
        className="block"
        style={{ padding: '0 8px', marginBottom: 2 }}
      >
        {({ isActive }) => (
          <div
            className="flex items-center gap-3 transition-all"
            style={{
              height: 44,
              padding: collapsed ? '0 11px' : '0 12px',
              borderRadius: 8,
              borderLeft: isActive ? '2px solid #2196C9' : '2px solid transparent',
              background: isActive ? 'rgba(33,150,201,0.12)' : 'transparent',
              color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.65)',
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'
                ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.9)'
              }
            }}
            onMouseLeave={e => {
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.background = 'transparent'
                ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.65)'
              }
            }}
          >
            <span style={{ color: isActive ? '#2196C9' : 'inherit', flexShrink: 0, opacity: isActive ? 1 : 0.7 }}>
              <Icon d={ICONS[icon]} />
            </span>
            {!collapsed && (
              <>
                <span style={{ fontSize: 14, fontWeight: 500, flex: 1, whiteSpace: 'nowrap' }}>{label}</span>
                {badge !== undefined && badge > 0 && (
                  <span style={{
                    fontSize: 11, fontWeight: 700, lineHeight: 1,
                    background: '#EB5757', color: '#fff',
                    borderRadius: 10, padding: '2px 6px', minWidth: 18, textAlign: 'center',
                  }}>{badge > 99 ? '99+' : badge}</span>
                )}
              </>
            )}
            {collapsed && badge !== undefined && badge > 0 && (
              <span style={{
                position: 'absolute', top: 8, right: 8,
                width: 8, height: 8, borderRadius: '50%', background: '#EB5757',
              }} />
            )}
          </div>
        )}
      </NavLink>
    )
  }

  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, bottom: 0,
        width: W, zIndex: 40,
        background: 'rgba(10,22,40,0.85)',
        WebkitBackdropFilter: 'blur(20px)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div style={{
        padding: collapsed ? '20px 0' : '20px 16px',
        display: 'flex', alignItems: 'center', gap: 10,
        justifyContent: collapsed ? 'center' : 'flex-start',
        flexShrink: 0,
      }}>
        <div style={{ flexShrink: 0 }}>
          <GeometricMotif variant="header" className="text-svep-accent" />
        </div>
        {!collapsed && (
          <div>
            <div style={{ color: '#fff', fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: '0.08em' }}>
              СВЭП
            </div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 1 }}>Экосистема</div>
          </div>
        )}
      </div>

      {/* divider */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', flexShrink: 0 }} />

      {/* Nav main */}
      <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingTop: 8 }}>
        {NAV_MAIN.map(item => (
          <NavItem key={item.to} {...item} />
        ))}

        {/* group label */}
        {!collapsed && (
          <div style={{
            padding: '16px 20px 4px',
            fontSize: 10, fontWeight: 600,
            color: 'rgba(255,255,255,0.35)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            Управление
          </div>
        )}
        {collapsed && <div style={{ height: 16 }} />}

        {NAV_WORK.map(item => (
          <NavItem
            key={item.to}
            {...item}
            badge={item.to === '/alerts' ? alertCount : undefined}
          />
        ))}
      </nav>

      {/* Bottom: user + logout */}
      <div style={{ flexShrink: 0 }}>
        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />
        <div style={{
          padding: collapsed ? '12px 0' : '12px 16px',
          display: 'flex', alignItems: 'center', gap: 10,
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}>
          {user ? (
            <>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(33,150,201,0.25)', border: '1px solid rgba(33,150,201,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, color: '#2196C9',
              }}>
                <Icon d={ICONS.user} size={16} />
              </div>
              {!collapsed && (
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.name.split(' ')[0]}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>
                    {ROLE_LABELS[user.role] ?? user.role}
                  </div>
                </div>
              )}
              {!collapsed && (
                <button
                  onClick={logout}
                  title="Выйти"
                  style={{
                    color: 'rgba(255,255,255,0.4)', background: 'transparent', border: 'none',
                    cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#EB5757')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
                >
                  <Icon d={ICONS.logout} size={16} />
                </button>
              )}
            </>
          ) : (
            <button
              onClick={() => navigate('/login')}
              style={{
                color: 'rgba(255,255,255,0.5)', background: 'transparent', border: 'none',
                cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center',
              }}
            >
              <Icon d={ICONS.logout} size={16} />
            </button>
          )}
        </div>

        {/* collapse toggle */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />
        <button
          onClick={onToggle}
          title={collapsed ? 'Развернуть' : 'Свернуть'}
          style={{
            width: '100%', height: 40,
            display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-end',
            paddingRight: collapsed ? 0 : 16,
            color: 'rgba(255,255,255,0.3)',
            background: 'transparent', border: 'none', cursor: 'pointer',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
        >
          <Icon d={collapsed ? ICONS.chevronR : ICONS.chevronL} size={16} />
        </button>
      </div>
    </div>
  )
}
