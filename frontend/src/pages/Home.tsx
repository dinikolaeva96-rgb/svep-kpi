import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMaster, getAlerts } from '@/api'
import type { MasterResponse, AlertsResponse } from '@/types'
import GeometricMotif from '@/components/GeometricMotif'
import CountUp from '@/components/CountUp'

function DomainIcon({ code }: { code: string }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (code) {
    case 'quality':
      return <svg viewBox="0 0 24 24" width={24} height={24} {...common}><path d="M8 3h8v4a4 4 0 0 1-8 0V3Z"/><path d="M8 7H5a3 3 0 0 0 3 3"/><path d="M16 7h3a3 3 0 0 1-3 3"/><path d="M12 14v4M9 21h6"/></svg>
    case 'delivery':
      return <svg viewBox="0 0 24 24" width={24} height={24} {...common}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
    case 'cost':
      return <svg viewBox="0 0 24 24" width={24} height={24} {...common}><path d="M12 3v18M16 7H10a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6H8"/></svg>
    case 'safety':
      return <svg viewBox="0 0 24 24" width={24} height={24} {...common}><path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3Z"/></svg>
    case 'morale':
      return <svg viewBox="0 0 24 24" width={24} height={24} {...common}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>
    case 'innovation':
      return <svg viewBox="0 0 24 24" width={24} height={24} {...common}><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3 11c.5.4 1 1.2 1 2h4c0-.8.5-1.6 1-2a6 6 0 0 0-3-11Z"/></svg>
    default:
      return null
  }
}

const DOMAIN_META = [
  { code: 'quality',    label: 'Производство',            desc: 'Эффективность производственных процессов', color: '#2196C9' },
  { code: 'delivery',   label: 'Бережливое производство',  desc: 'Устранение потерь и оптимизация',           color: '#27AE60' },
  { code: 'cost',       label: 'Люди',                     desc: 'Развитие и мотивация сотрудников',          color: '#F2994A' },
  { code: 'safety',     label: 'Знания и технологии',      desc: 'Компетенции и инновации',                   color: '#EB5757' },
  { code: 'morale',     label: 'Внешняя среда',            desc: 'Взаимодействие с клиентами и партнёрами',   color: '#2196C9' },
  { code: 'innovation', label: 'Культура и среда',         desc: 'Корпоративная культура',                    color: '#27AE60' },
]

export default function Home() {
  const [master,  setMaster]  = useState<MasterResponse | null>(null)
  const [alerts,  setAlerts]  = useState<AlertsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getMaster().then(setMaster),
      getAlerts().then(setAlerts).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [])

  const avgScore = master
    ? Math.round(master.departments.map(d => d.overall_score ?? 0).reduce((a, b) => a + b, 0) / (master.departments.length || 1))
    : null

  const alertCount = alerts ? alerts.summary.red + alerts.summary.yellow : null

  const domainAvgs = master
    ? DOMAIN_META.map(dm => {
        const vals = master.departments
          .map(d => d.domains[dm.code]?.score)
          .filter((v): v is number => v !== null && v !== undefined)
        return { ...dm, avg: vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null }
      })
    : DOMAIN_META.map(dm => ({ ...dm, avg: null }))

  const kpis = [
    { value: 16,  label: 'Отделов' },
    { value: 106, label: 'Сотрудников' },
    { value: avgScore ?? 0, suffix: '%', label: 'Средний KPI', danger: false },
    { value: alertCount ?? 0, label: 'Алертов', danger: (alertCount ?? 0) > 0 },
  ]

  return (
    <div className="min-h-full" style={{ background: 'var(--bg)' }}>
      {/* Hero — section 4.2 */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0D1B2A 0%, #112233 100%)', minHeight: 420 }}
      >
        {/* Background facet pattern, 5% opacity */}
        <GeometricMotif variant="watermark" className="text-svep-accent opacity-[0.05] !absolute top-0 right-0" />

        <div className="relative max-w-screen-xl mx-auto px-6 py-16 md:py-20 grid md:grid-cols-[1fr_280px] gap-12 items-center">
          <div>
            <p className="eyebrow mb-5">ООО СРЕДНЕВОЛЖСКЭЛЕКТРОПРОЕКТ · КАЗАНЬ</p>
            <h1 className="font-display font-extrabold text-[56px] leading-[1.05] tracking-[-0.5px] text-white mb-5">
              Экосистема<br/>
              <span style={{ color: 'var(--accent)' }}>СВЭП</span>
            </h1>
            <p className="text-[#8FA3B8] text-base leading-relaxed max-w-md mb-10">
              KPI-портал для 16 отделов и 106 сотрудников. Проектирование электросетей 0.4–220 кВ.
            </p>

            {/* KPI plaques */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">
              {kpis.map((s, i) => (
                <div
                  key={i}
                  className="rounded-[8px] p-4 transition-colors"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid #1E3248',
                    borderTop: '2px solid var(--accent)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(33,150,201,0.08)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = '#1E3248' }}
                >
                  <span
                    className="mono-num block text-[40px] leading-none font-bold"
                    style={{ color: s.danger ? '#EB5757' : '#FFFFFF' }}
                  >
                    <CountUp value={s.value} suffix={s.suffix} delay={i * 100} />
                  </span>
                  <p className="eyebrow mt-2 text-[#8FA3B8]" style={{ letterSpacing: '1.5px' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Decorative rotating crystal */}
          <div className="hidden md:flex items-center justify-center">
            <GeometricMotif variant="hero" className="text-svep-accent opacity-25 crystal-spin" />
          </div>
        </div>
      </section>

      {/* 6 Lean-domains — section 4.3 */}
      <section className="max-w-screen-xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-[32px] tracking-[-0.01em]" style={{ color: 'var(--night)' }}>
            6 lean-доменов
          </h2>
          <Link to="/master" className="eyebrow hover:underline">
            Мастер-карта →
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {domainAvgs.map((d, i) => (
            <Link
              key={d.code}
              to={`/domain/${d.code}`}
              className="group relative bg-white transition-all hover:-translate-y-0.5 overflow-hidden flex flex-col"
              style={{
                borderLeft: `3px solid ${d.color}`,
                borderRadius: 12,
                boxShadow: '0 2px 16px rgba(13,27,42,0.08)',
              }}
            >
              <div className="p-5 pb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-display font-bold text-[11px] uppercase tracking-[2px]" style={{ color: d.color }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {d.avg !== null ? (
                    <span className="mono-num text-sm font-semibold" style={{ color: d.color }}>
                      {d.avg}%
                    </span>
                  ) : (
                    <span className="text-[#8FA3B8] text-sm">—</span>
                  )}
                </div>

                <div className="mb-3" style={{ color: d.color }}>
                  <DomainIcon code={d.code} />
                </div>

                <div className="font-semibold text-[18px]" style={{ color: 'var(--night)' }}>
                  {d.label}
                </div>
                <div className="text-[#4A5568] text-sm mt-1">
                  {d.desc}
                </div>
              </div>

              {/* Status bar — progress of domain KPI */}
              <div className="mt-auto h-1" style={{ background: 'var(--mist)' }}>
                <div className="h-full transition-all" style={{ width: `${d.avg ?? 0}%`, background: d.color }} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick actions */}
      <section className="max-w-screen-xl mx-auto px-6 pb-12 grid sm:grid-cols-3 gap-4">
        <Link to="/alerts"
          className="group bg-white border border-svep-border hover:border-[#EB5757]/40 rounded-xl p-5 transition-all">
          <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="#2196C9" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="mb-2">
            <path d="M12 9v4M12 17h.01"/><path d="m10.3 4.3-7.6 13a1.5 1.5 0 0 0 1.3 2.2h16a1.5 1.5 0 0 0 1.3-2.2l-7.6-13a1.5 1.5 0 0 0-2.6 0Z"/>
          </svg>
          <div className="font-medium group-hover:text-[#EB5757]" style={{ color: 'var(--night)' }}>Алерты</div>
          <div className="text-sm text-[#4A5568] mt-1">
            {alerts ? `${alerts.summary.red + alerts.summary.yellow} показателей вне нормы` : '…'}
          </div>
        </Link>
        <Link to="/kaizen"
          className="group bg-white border border-svep-border hover:border-svep-accent/40 rounded-xl p-5 transition-all">
          <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="#2196C9" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="mb-2">
            <path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3 11c.5.4 1 1.2 1 2h4c0-.8.5-1.6 1-2a6 6 0 0 0-3-11Z"/>
          </svg>
          <div className="font-medium group-hover:text-svep-accent" style={{ color: 'var(--night)' }}>Кайдзен</div>
          <div className="text-sm text-[#4A5568] mt-1">Предложения по улучшению</div>
        </Link>
        <Link to="/dashboard"
          className="group bg-white border border-svep-border hover:border-svep-accent/40 rounded-xl p-5 transition-all">
          <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="#2196C9" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="mb-2">
            <rect x="3" y="4" width="18" height="13" rx="1.5"/><path d="M8 21h8M12 17v4"/>
          </svg>
          <div className="font-medium group-hover:text-svep-accent" style={{ color: 'var(--night)' }}>TV-дашборд</div>
          <div className="text-sm text-[#4A5568] mt-1">Публичный экран</div>
        </Link>
      </section>

      {/* Departments */}
      <section className="max-w-screen-xl mx-auto px-6 pb-16">
        <h2 className="font-display font-bold text-[32px] tracking-[-0.01em] mb-5" style={{ color: 'var(--night)' }}>Отделы</h2>
        {loading ? (
          <div className="text-[#8FA3B8] text-center py-12">Загрузка…</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {master?.departments.map(dept => {
              const score = dept.overall_score
              const scoreColor = score === null ? '#8FA3B8'
                : score >= 80 ? '#27AE60'
                : score >= 60 ? '#F2994A'
                : '#EB5757'
              const hasAlert = alerts?.alerts.some(a => a.dept_id === dept.id)
              return (
                <Link
                  key={dept.id}
                  to={`/dept/${dept.id}`}
                  className="bg-white border border-svep-border hover:border-svep-accent/50 rounded-xl p-4 text-center transition-all hover:-translate-y-0.5 group relative"
                >
                  {hasAlert && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full" style={{ background: '#EB5757' }} />
                  )}
                  <div className="text-sm font-bold group-hover:text-svep-accent transition-colors" style={{ color: 'var(--night)' }}>
                    {dept.name_short}
                  </div>
                  <div className="eyebrow mt-1" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 11, color: '#8FA3B8' }}>
                    {dept.staff_count} чел.
                  </div>
                  <div className="mono-num text-sm font-semibold mt-2" style={{ color: scoreColor }}>
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
