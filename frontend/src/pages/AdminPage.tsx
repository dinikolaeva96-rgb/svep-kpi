import { useState } from 'react'
import { Link }     from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import UsersAdmin      from './admin/UsersAdmin'
import IndicatorsAdmin from './admin/IndicatorsAdmin'
import AuditLog        from './admin/AuditLog'

type Tab = 'users' | 'indicators' | 'audit'

const TABS: { key: Tab; label: string; icon: string; minRole: string }[] = [
  { key: 'users',      label: 'Пользователи', icon: '👥', minRole: 'admin' },
  { key: 'indicators', label: 'Индикаторы',   icon: '⚙️', minRole: 'dept_head' },
  { key: 'audit',      label: 'Аудит',        icon: '📋', minRole: 'management' },
]

const ROLE_LEVELS: Record<string, number> = { public: 0, dept_head: 1, management: 2, admin: 3 }

export default function AdminPage() {
  const { user } = useAuthStore()
  const [tab, setTab] = useState<Tab>('users')

  if (!user || ROLE_LEVELS[user.role] < 1) {
    return (
      <div className="pt-32 text-center text-svep-tertiary">
        <div className="text-5xl mb-4">🔒</div>
        <div className="text-xl font-semibold text-svep-primary mb-2">Нет доступа</div>
        <p className="text-svep-secondary mb-4">Эта страница доступна только администраторам и руководству.</p>
        <Link to="/" className="text-svep-accent hover:underline">← На главную</Link>
      </div>
    )
  }

  const availableTabs = TABS.filter(t => ROLE_LEVELS[user.role] >= ROLE_LEVELS[t.minRole])

  return (
    <div className="bg-svep-bg min-h-full">
      <div className="max-w-screen-xl mx-auto px-4 pb-12">
        <div className="py-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-svep-primary">Администрирование</h1>
            <p className="text-svep-secondary text-sm mt-1">
              Управление системой · {user.role === 'admin' ? 'Полный доступ' : 'Ограниченный доступ'}
            </p>
          </div>

          {/* Быстрая статистика */}
          <div className="flex gap-3 text-center">
            {[
              { icon: '⚡', label: 'Портал',    value: 'СВЭП' },
              { icon: '👤', label: 'Вы',        value: user.name.split(' ')[0] },
              { icon: '🔑', label: 'Роль',      value: user.role },
            ].map(s => (
              <div key={s.label} className="bg-svep-surface border border-svep-border rounded-xl px-4 py-2 text-center">
                <div className="text-lg">{s.icon}</div>
                <div className="text-svep-primary text-xs font-medium">{s.value}</div>
                <div className="text-svep-tertiary text-[10px]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Вкладки */}
        <div className="flex gap-1 border-b border-svep-border mb-6">
          {availableTabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                tab === t.key
                  ? 'border-svep-accent text-svep-primary'
                  : 'border-transparent text-svep-tertiary hover:text-svep-secondary'
              }`}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Контент вкладки */}
        <div>
          {tab === 'users'      && <UsersAdmin />}
          {tab === 'indicators' && <IndicatorsAdmin />}
          {tab === 'audit'      && <AuditLog />}
        </div>
      </div>
    </div>
  )
}
