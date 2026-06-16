import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMaster, getCompanyTrends, getAlerts } from '@/api'
import type { MasterResponse, TrendPoint, AlertsResponse } from '@/types'
import GeometricMotif from '@/components/GeometricMotif'

function DomainIcon({ code }: { code: string }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (code) {
    case 'quality':
      return <svg viewBox="0 0 24 24" width={18} height={18} {...common}><path d="M8 3h8v4a4 4 0 0 1-8 0V3Z"/><path d="M8 7H5a3 3 0 0 0 3 3"/><path d="M16 7h3a3 3 0 0 1-3 3"/><path d="M12 14v4M9 21h6"/></svg>
    case 'delivery':
      return <svg viewBox="0 0 24 24" width={18} height={18} {...common}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
    case 'cost':
      return <svg viewBox="0 0 24 24" width={18} height={18} {...common}><path d="M12 3v18M16 7H10a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6H8"/></svg>
    case 'safety':
      return <svg viewBox="0 0 24 24" width={18} height={18} {...common}><path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3Z"/></svg>
    case 'morale':
      return <svg viewBox="0 0 24 24" width={18} height={18} {...common}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>
    case 'innovation':
      return <svg viewBox="0 0 24 24" width={18} height={18} {...common}><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3 11c.5.4 1 1.2 1 2h4c0-.8.5-1.6 1-2a6 6 0 0 0-3-11Z"/></svg>
    default:
      return null
  }
}

const DOMAIN_META = [
  { code: 'quality',    label: 'Качество',     desc: 'Доля проектов без замечаний' },
  { code: 'delivery',   label: 'Сроки',        desc: 'Соблюдение планов-графиков' },
  { code: 'cost',       label: 'Затраты',       desc: 'Контроль бюджетных отклонений' },
  { code: 'safety',     label: 'Безопасность', desc: 'Инциденты и нарушения' },
  { code: 'morale',     label: 'Вовлечённость', desc: 'Индекс удовлетворённости' },
  { code: 'innovation', label: 'Инновации',    desc: 'Кайдзен-предложения' },
]

export default function Home() {
  const [master,  setMaster]  = useState<MasterResponse | null>(null)
  const [trends,  setTrends]  = useState<TrendPoint[]>([])
  const [alerts,  setAlerts]  = useState<AlertsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getMaster().then(setMaster),
      getCompanyTrends(6).then(d => setTrends(d.points)).catch(() => {}),
      getAlerts().then(setAlerts).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [])

  const avgScore = master
    ? Math.round(master.departments.map(d => d.overall_score ?? 0).reduce((a, b) => a + b, 0) / (master.departments.length || 1))
    : null

  const trendDir = trends.length >= 2
    ? ((trends[trends.length - 1].score ?? 0) - (trends[trends.length - 2].score ?? 0))
    : 0
  const trendIcon = trendDir > 0 ? '↑' : trendDir < 0 ? '↓' : '→'

  const alertCount = alerts ? alerts.summary.red + alerts.summary.yellow : null

  const domainAvgs = master
    ? DOMAIN_META.map(dm => {
        const vals = master.departments
          .map(d => d.domains[dm.code]?.score)
          .filter((v): v is number => v !== null && v !== undefined)
        return { ...dm, avg: vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null }
      })
    : DOMAIN_META.map(dm => ({ ...dm, avg: null }))

  return (
    <div className="pt-14 bg-svep-bg min-h-screen">
      {/* Hero */}
      <section className="relative max-w-screen-xl mx-auto px-6 py-16 md:py-20 overflow-hidden">
        <div className="relative grid md:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <p className="eyebrow mb-5">ООО Средневолжскэлектропроект · Казань</p>
            <h1 className="font-brutal font-extrabold text-[42px] leading-[1.05] tracking-[-0.01em] text-svep-primary mb-5">
              Экосистема<br/>
              <span style={{ color: 'var(--accent)' }}>СВЭП</span>
            </h1>
            <p className="text-svep-secondary text-base leading-relaxed max-w-md mb-10">
              KPI-портал для 16 отделов и 106 сотрудников. Проектирование электросетей 0.4–220 кВ.
            </p>

            {/* 4 Stats */}
            <div className="grid grid-cols-4 gap-0">
              {[
                { value: '16',    label: 'Отделов' },
                { value: '106',   label: 'Сотрудников' },
                { value: avgScore !== null ? `${avgScore}%` : '…', label: 'Средний KPI', extra: trendDir !== 0 ? trendIcon : undefined, extraColor: trendDir > 0 ? '#16A34A' : '#DC2626' },
                { value: alertCount !== null ? String(alertCount) : '…', label: 'Алертов', valueColor: (alertCount ?? 0) > 0 ? '#DC2626' : '#16A34A' },
              ].map((s, i) => (
                <div key={i} className="pt-4 pr-4" style={{ borderTop: '1px solid var(--border)' }}>
                  <div className="flex items-baseline gap-1">
                    <span className="mono-num text-[22px] font-medium text-svep-primary" style={s.valueColor ? { color: s.valueColor } : {}}>
                      {s.value}
                    </span>
                    {s.extra && (
                      <span className="text-sm" style={{ color: s.extraColor }}>{s.extra}</span>
                    )}
                  </div>
                  <p className="eyebrow mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — decorative motif */}
          <div className="hidden md:flex items-center justify-center">
            <GeometricMotif variant="watermark" className="!relative" />
          </div>
        </div>
      </section>

      {/* 6 Domains — numbered list */}
      <section className="max-w-screen-xl mx-auto px-6 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-brutal font-black text-2xl tracking-[-0.01em] text-svep-primary">
            6 lean-доменов
          </h2>
          <Link to="/master" className="eyebrow text-svep-accent hover:underline">
            Мастер-карта →
          </Link>
        </div>

        <div className="divide-y divide-svep-border">
          {domainAvgs.map((d, i) => (
            <Link
              key={d.code}
              to={`/domain/${d.code}`}
              className="group relative flex items-center gap-5 py-4 hover:bg-gray-50 transition-colors px-2 -mx-2 rounded-lg overflow-hidden"
            >
              <GeometricMotif variant="ghost" className="!absolute -top-6 -right-6" />

              {/* Number */}
              <span className="mono-num text-svep-tertiary w-7 text-sm shrink-0">
                {String(i + 1).padStart(2, '0')}
              </span>

              {/* Icon box */}
              <div className={`w-9 h-9 flex items-center justify-center rounded border shrink-0 ${
                d.code === 'innovation'
                  ? 'border-svep-accent text-svep-accent'
                  : 'border-svep-border text-svep-secondary'
              }`}>
                <DomainIcon code={d.code} />
              </div>

              {/* Label + desc */}
              <div className="flex-1 min-w-0">
                <div className="text-svep-primary font-medium text-sm group-hover:text-svep-accent transition-colors">
                  {d.label}
                </div>
                <div className="eyebrow mt-0.5 normal-case tracking-normal text-svep-tertiary" style={{ textTransform: 'none', letterSpacing: 0 }}>
                  {d.desc}
                </div>
              </div>

              {/* Score */}
              {d.avg !== null ? (
                <span className={`mono-num text-sm font-medium shrink-0 ${
                  d.avg >= 80 ? 'text-green-600' : d.avg >= 60 ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {d.avg}%
                </span>
              ) : (
                <span className="text-svep-tertiary text-sm shrink-0">—</span>
              )}

              {/* Arrow */}
              <span className="text-svep-tertiary group-hover:text-svep-accent transition-colors text-sm shrink-0">→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick actions */}
      <section className="max-w-screen-xl mx-auto px-6 pb-12 grid sm:grid-cols-3 gap-4">
        <Link to="/alerts"
          className="group bg-svep-surface border border-svep-border hover:border-red-200 rounded-xl p-5 transition-all">
          <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="#185FA5" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="mb-2">
            <path d="M12 9v4M12 17h.01"/><path d="m10.3 4.3-7.6 13a1.5 1.5 0 0 0 1.3 2.2h16a1.5 1.5 0 0 0 1.3-2.2l-7.6-13a1.5 1.5 0 0 0-2.6 0Z"/>
          </svg>
          <div className="font-medium text-svep-primary group-hover:text-red-600">Алерты</div>
          <div className="text-sm text-svep-secondary mt-1">
            {alerts ? `${alerts.summary.red + alerts.summary.yellow} показателей вне нормы` : '…'}
          </div>
        </Link>
        <Link to="/kaizen"
          className="group bg-svep-surface border border-svep-border hover:border-svep-accent/40 rounded-xl p-5 transition-all">
          <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="#185FA5" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="mb-2">
            <path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3 11c.5.4 1 1.2 1 2h4c0-.8.5-1.6 1-2a6 6 0 0 0-3-11Z"/>
          </svg>
          <div className="font-medium text-svep-primary group-hover:text-svep-accent">Кайдзен</div>
          <div className="text-sm text-svep-secondary mt-1">Предложения по улучшению</div>
        </Link>
        <Link to="/dashboard"
          className="group bg-svep-surface border border-svep-border hover:border-svep-accent/40 rounded-xl p-5 transition-all">
          <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="#185FA5" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="mb-2">
            <rect x="3" y="4" width="18" height="13" rx="1.5"/><path d="M8 21h8M12 17v4"/>
          </svg>
          <div className="font-medium text-svep-primary group-hover:text-svep-accent">TV-дашборд</div>
          <div className="text-sm text-svep-secondary mt-1">Публичный экран</div>
        </Link>
      </section>

      {/* Departments */}
      <section className="max-w-screen-xl mx-auto px-6 pb-16">
        <h2 className="font-brutal font-black text-2xl tracking-[-0.01em] text-svep-primary mb-5">Отделы</h2>
        {loading ? (
          <div className="text-svep-tertiary text-center py-12">Загрузка…</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {master?.departments.map(dept => {
              const score = dept.overall_score
              const scoreColor = score === null ? 'text-svep-tertiary'
                : score >= 80 ? 'text-green-600'
                : score >= 60 ? 'text-amber-600'
                : 'text-red-600'
              const hasAlert = alerts?.alerts.some(a => a.dept_id === dept.id)
              return (
                <Link
                  key={dept.id}
                  to={`/dept/${dept.id}`}
                  className="bg-svep-surface border border-svep-border hover:border-svep-accent/50 rounded-xl p-4 text-center transition-all hover:-translate-y-0.5 group relative"
                >
                  {hasAlert && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
                  )}
                  <div className="text-sm font-bold text-svep-primary group-hover:text-svep-accent transition-colors">
                    {dept.name_short}
                  </div>
                  <div className="eyebrow mt-1" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 11 }}>
                    {dept.staff_count} чел.
                  </div>
                  <div className={`mono-num text-sm font-medium mt-2 ${scoreColor}`}>
                    {score !== null ? `${score}%` : '—'}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
