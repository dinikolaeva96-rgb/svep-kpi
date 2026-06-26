import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAlerts } from '@/api'
import type { AlertsResponse, AlertItem } from '@/types'

/* ── Mock data ──────────────────────────────────────────────── */
const MOCK_ALERTS: AlertItem[] = [
  {
    indicator_id: 2, dept_id: 1, dept_name: 'ОВЛ',
    domain_code: 'delivery', domain_name: 'Сроки', domain_color: '#1D9E75', domain_icon: '⏱',
    code: 'OVL_on_time_rate', name: 'Соблюдение сроков', unit: '%',
    actual: 72, plan: 90, target: 90, warning_thr: 85, critical_thr: 75, weight: 1,
    comment: null, status: 'red', trend: 'down', prev_actual: 79,
  },
  {
    indicator_id: 13, dept_id: 3, dept_name: 'ОПС',
    domain_code: 'quality', domain_name: 'Качество', domain_color: '#2196C9', domain_icon: '🏆',
    code: 'OPS_quality_score', name: 'Индекс качества', unit: '%',
    actual: 88, plan: 95, target: 95, warning_thr: 90, critical_thr: 80, weight: 1,
    comment: null, status: 'yellow', trend: 'stable', prev_actual: 87,
  },
  {
    indicator_id: 54, dept_id: 9, dept_name: 'ТО',
    domain_code: 'innovation', domain_name: 'Инновации', domain_color: '#F2C94C', domain_icon: '💡',
    code: 'TO_kaizen_count', name: 'Кайдзен-предложения', unit: 'шт',
    actual: 1, plan: 3, target: 3, warning_thr: 2, critical_thr: 1, weight: 1,
    comment: null, status: 'yellow', trend: 'down', prev_actual: 2,
  },
]

type FilterTab = 'all' | 'red' | 'yellow' | 'resolved'

const MONTHS = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек']

/* ── Status border colour ───────────────────────────────────── */
function statusColor(s: string) {
  return s === 'red' ? '#EB5757' : '#F2994A'
}

/* ── Progress bar ───────────────────────────────────────────── */
function MiniProgress({ actual, plan, status }: { actual: number; plan: number; status: string }) {
  const pct = Math.min(Math.round((actual / plan) * 100), 100)
  return (
    <div style={{ height: 4, borderRadius: 2, background: '#F0F4F8', overflow: 'hidden', marginTop: 10 }}>
      <div style={{
        height: '100%', borderRadius: 2,
        width: `${pct}%`,
        background: statusColor(status),
        transition: 'width 0.6s ease',
      }} />
    </div>
  )
}

/* ── Signal card ────────────────────────────────────────────── */
function SignalCard({ alert, month, year }: { alert: AlertItem; month: number; year: number }) {
  const deviation = alert.plan
    ? Math.round(((alert.actual ?? 0) - alert.plan) / alert.plan * 100)
    : null
  const devStr = deviation !== null
    ? (deviation >= 0 ? `+${deviation}%` : `${deviation}%`)
    : null

  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      borderLeft: `3px solid ${statusColor(alert.status)}`,
      padding: '20px 24px',
      boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
      transition: 'box-shadow 0.2s ease',
    }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 8px rgba(0,0,0,0.06)')}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: statusColor(alert.status), flexShrink: 0, display: 'inline-block',
        }} />
        <Link to={`/dept/${alert.dept_id}`} style={{
          fontSize: 13, fontWeight: 600, color: '#1C84C6', textDecoration: 'none',
        }}
          onClick={e => e.stopPropagation()}>
          {alert.dept_name}
        </Link>
        <span style={{ fontSize: 12, color: '#8FA3B8' }}>{alert.domain_name}</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#A0B4C8' }}>
          {MONTHS[month - 1]} {year}
        </span>
      </div>

      {/* Indicator name */}
      <div style={{ fontSize: 15, fontWeight: 600, color: '#0D1B2A', marginBottom: 12 }}>
        {alert.name}
      </div>

      {/* Data row */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'baseline', flexWrap: 'wrap' }}>
        <div>
          <span style={{ fontSize: 22, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
            color: statusColor(alert.status) }}>
            {alert.actual ?? '—'}
          </span>
          <span style={{ fontSize: 12, color: '#8FA3B8', marginLeft: 4 }}>{alert.unit} · факт</span>
        </div>
        <div>
          <span style={{ fontSize: 15, fontWeight: 500, color: '#4A6580' }}>{alert.plan ?? alert.target}</span>
          <span style={{ fontSize: 12, color: '#8FA3B8', marginLeft: 4 }}>{alert.unit} · план</span>
        </div>
        {devStr && (
          <div style={{
            marginLeft: 'auto',
            fontSize: 13, fontWeight: 700,
            color: deviation! >= 0 ? '#1D9E75' : statusColor(alert.status),
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {devStr}
          </div>
        )}
      </div>

      {/* Progress */}
      {alert.actual != null && (alert.plan ?? alert.target) > 0 && (
        <MiniProgress actual={alert.actual} plan={alert.plan ?? alert.target} status={alert.status} />
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
        {alert.prev_actual != null && (
          <span style={{ fontSize: 11, color: '#A0B4C8' }}>
            Пред. период: {alert.prev_actual} {alert.unit}
          </span>
        )}
        <Link
          to={`/dept/${alert.dept_id}/kpi/${alert.indicator_id}`}
          style={{
            marginLeft: 'auto', fontSize: 12, fontWeight: 600,
            color: '#1C84C6', textDecoration: 'none',
            padding: '4px 10px', borderRadius: 6,
            border: '1px solid rgba(28,132,198,0.25)',
            background: 'rgba(28,132,198,0.06)',
          }}
          onClick={e => e.stopPropagation()}
        >
          Взять в работу →
        </Link>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════ */
export default function AlertsPage() {
  const [data,    setData]    = useState<AlertsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [year,    setYear]    = useState(new Date().getFullYear())
  const [month,   setMonth]   = useState(new Date().getMonth() + 1)
  const [tab,     setTab]     = useState<FilterTab>('all')
  const [deptFilter, setDeptFilter] = useState<string>('all')

  useEffect(() => {
    setLoading(true)
    getAlerts(year, month).then(setData).catch(() => {}).finally(() => setLoading(false))
  }, [year, month])

  const apiAlerts: AlertItem[] = data?.alerts ?? []
  const useMock = !loading && apiAlerts.length === 0

  const source = useMock ? MOCK_ALERTS : apiAlerts

  const filtered = source.filter(a => {
    if (tab === 'red') return a.status === 'red'
    if (tab === 'yellow') return a.status === 'yellow'
    if (tab === 'resolved') return false
    return true
  }).filter(a => deptFilter === 'all' || a.dept_name === deptFilter)

  const redCount    = source.filter(a => a.status === 'red').length
  const yellowCount = source.filter(a => a.status === 'yellow').length
  const totalActive = redCount + yellowCount

  const depts = Array.from(new Set(source.map(a => a.dept_name))).sort()

  const TABS: { key: FilterTab; label: string; count?: number }[] = [
    { key: 'all',      label: 'Все',            count: totalActive },
    { key: 'red',      label: 'Критические',    count: redCount },
    { key: 'yellow',   label: 'Предупреждения', count: yellowCount },
    { key: 'resolved', label: 'Решённые',       count: 0 },
  ]

  return (
    <div style={{ background: '#EEF4FA', minHeight: '100vh', padding: '32px 40px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>

        {/* ── Header ─────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
              <h1 style={{ margin: 0, fontSize: 28, fontFamily: "'Exo 2', sans-serif",
                fontWeight: 700, color: '#0D1B2A' }}>
                Сигналы
              </h1>
              {totalActive > 0 && (
                <span style={{
                  fontSize: 13, fontWeight: 700, color: '#fff',
                  background: '#EB5757', borderRadius: 100,
                  padding: '2px 10px',
                }}>
                  {totalActive} активных
                </span>
              )}
            </div>
            <p style={{ margin: 0, fontSize: 14, color: '#4A6580' }}>
              Отклонения показателей от плановых значений
            </p>
          </div>

          {/* Period selector */}
          <div style={{ display: 'flex', gap: 8 }}>
            <select
              value={month}
              onChange={e => setMonth(+e.target.value)}
              style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(28,132,198,0.2)',
                background: '#fff', fontSize: 13, color: '#0D1B2A', cursor: 'pointer' }}>
              {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <select
              value={year}
              onChange={e => setYear(+e.target.value)}
              style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(28,132,198,0.2)',
                background: '#fff', fontSize: 13, color: '#0D1B2A', cursor: 'pointer' }}>
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {/* ── Filter bar ─────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500,
              border: tab === t.key ? '1px solid #1C84C6' : '1px solid rgba(28,132,198,0.18)',
              background: tab === t.key ? '#1C84C6' : '#fff',
              color: tab === t.key ? '#fff' : '#4A6580',
              transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span style={{
                  fontSize: 11, fontWeight: 700, lineHeight: 1,
                  background: tab === t.key ? 'rgba(255,255,255,0.25)' : 'rgba(28,132,198,0.12)',
                  color: tab === t.key ? '#fff' : '#1C84C6',
                  borderRadius: 10, padding: '1px 6px',
                }}>{t.count}</span>
              )}
            </button>
          ))}

          {/* Dept filter */}
          {depts.length > 0 && (
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              style={{ marginLeft: 'auto', padding: '6px 10px', borderRadius: 8,
                border: '1px solid rgba(28,132,198,0.18)', background: '#fff',
                fontSize: 13, color: '#0D1B2A', cursor: 'pointer' }}>
              <option value="all">Все отделы</option>
              {depts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          )}
        </div>

        {/* ── Content ────────────────────────────────────── */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ background: '#fff', borderRadius: 12, borderLeft: '3px solid #E2E8F0',
                padding: '20px 24px', height: 120, opacity: 0.6 }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>
              <svg viewBox="0 0 24 24" width={56} height={56} fill="none"
                stroke="#1D9E75" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
                style={{ margin: '0 auto', display: 'block' }}>
                <circle cx="12" cy="12" r="10"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#0D1B2A', marginBottom: 8 }}>
              Все показатели в норме
            </div>
            <div style={{ fontSize: 14, color: '#6B8AA8' }}>
              Отклонений за выбранный период не обнаружено
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {useMock && (
              <div style={{ padding: '8px 14px', borderRadius: 8, background: 'rgba(28,132,198,0.08)',
                border: '1px solid rgba(28,132,198,0.2)', fontSize: 12, color: '#4A6580', marginBottom: 4 }}>
                Показаны демо-данные — API не вернул сигналы за выбранный период
              </div>
            )}
            {filtered.map(a => <SignalCard key={`${a.dept_id}-${a.indicator_id}`} alert={a} month={month} year={year} />)}
          </div>
        )}
      </div>
    </div>
  )
}
