import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMaster, getAlerts } from '@/api'
import type { MasterResponse, AlertsResponse } from '@/types'
import GeometricMotif from '@/components/GeometricMotif'
import CountUp from '@/components/CountUp'

/* ── Domain config ─────────────────────────────────────────── */
const DOMAIN_META = [
  { code: 'quality',    label: 'Производство',           desc: 'Эффективность производственных процессов',  color: '#2196C9', mock: 82 },
  { code: 'delivery',   label: 'Бережливое производство', desc: 'Устранение потерь и оптимизация',            color: '#1D9E75', mock: 91 },
  { code: 'cost',       label: 'Люди',                    desc: 'Развитие и мотивация сотрудников',           color: '#9B51E0', mock: 78 },
  { code: 'safety',     label: 'Знания и технологии',     desc: 'Компетенции и инновации',                    color: '#F2994A', mock: 85 },
  { code: 'morale',     label: 'Внешняя среда',           desc: 'Взаимодействие с клиентами и партнёрами',    color: '#EB5757', mock: 73 },
  { code: 'innovation', label: 'Культура и среда',        desc: 'Корпоративная культура',                     color: '#F2C94C', mock: 88 },
]

/* ── Sparkline ──────────────────────────────────────────────── */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const min = Math.min(...data); const max = Math.max(...data)
  const W = 60; const H = 24; const n = data.length
  const x = (i: number) => (i / (n - 1)) * W
  const y = (v: number) => H - ((v - min) / (max - min || 1)) * (H - 4) - 2
  const d = data.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none">
      <path d={d} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={x(n - 1)} cy={y(data[n - 1])} r={2} fill={color} />
    </svg>
  )
}

/* ── Domain icon ────────────────────────────────────────────── */
function DomainIcon({ code, color }: { code: string; color: string }) {
  const paths: Record<string, string[]> = {
    quality:    ['M8 3h8v4a4 4 0 0 1-8 0V3Z','M8 7H5a3 3 0 0 0 3 3','M16 7h3a3 3 0 0 1-3 3','M12 14v4M9 21h6'],
    delivery:   ['M12 3a9 9 0 1 0 0 18A9 9 0 0 0 12 3z','M12 7v5l3 2'],
    cost:       ['M12 3v18','M16 7H10a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6H8'],
    safety:     ['M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3Z'],
    morale:     ['M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2','M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'],
    innovation: ['M9 18h6','M10 21h4','M12 3a6 6 0 0 0-3 11c.5.4 1 1.2 1 2h4c0-.8.5-1.6 1-2a6 6 0 0 0-3-11Z'],
  }
  return (
    <svg viewBox="0 0 24 24" width={22} height={22} fill="none"
      stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      {(paths[code] ?? []).map((p, i) => <path key={i} d={p} />)}
    </svg>
  )
}

/* ── Progress bar with IntersectionObserver ─────────────────── */
function AnimatedBar({ pct, color }: { pct: number; color: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [started, setStarted] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setStarted(true); obs.disconnect() }
    }, { threshold: 0.2 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} style={{ height: 3, borderRadius: 2, background: 'rgba(28,132,198,0.08)', overflow: 'hidden' }}>
      <div style={{
        height: '100%', borderRadius: 2,
        width: started ? `${pct}%` : '0%',
        background: `linear-gradient(90deg, ${color}88, ${color})`,
        transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
      }} />
    </div>
  )
}

/* ── Domain Card ──────────────────────────────────────────────── */
function DomainCard({ domain, index }: {
  domain: { code: string; label: string; desc: string; color: string; avg: number };
  index: number
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <Link
      to={`/domain/${domain.code}`}
      className="card-enter"
      style={{ animationDelay: `${index * 80}ms`, textDecoration: 'none', display: 'block' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        background: hovered ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.75)',
        border: hovered ? '1px solid rgba(28,132,198,0.3)' : '1px solid rgba(28,132,198,0.12)',
        borderRadius: 20, padding: 28,
        WebkitBackdropFilter: 'blur(8px)',
        backdropFilter: 'blur(8px)',
        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered
          ? '0 8px 32px rgba(28,132,198,0.12)'
          : '0 2px 16px rgba(0,0,0,0.04)',
        cursor: 'pointer',
        height: '100%',
        boxSizing: 'border-box' as const,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 600,
            color: '#A0B4C8', letterSpacing: '0.05em' }}>
            {String(index + 1).padStart(2, '0')}
          </span>
          <DomainIcon code={domain.code} color={domain.color} />
        </div>

        <div style={{ fontSize: 18, fontFamily: "'Exo 2', sans-serif", fontWeight: 600,
          color: '#0D1B2A', marginBottom: 6 }}>
          {domain.label}
        </div>
        <div style={{ fontSize: 13, color: '#6B8AA8', lineHeight: 1.5,
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
          {domain.desc}
        </div>

        <div style={{ height: 1, background: 'rgba(28,132,198,0.08)', margin: '16px 0' }} />

        <AnimatedBar pct={domain.avg} color={domain.color} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, color: domain.color }}>
            {domain.avg}%
          </span>
          <span style={{
            fontSize: 14, color: '#A0B4C8',
            transform: hovered ? 'translateX(4px)' : 'translateX(0)',
            transition: 'transform 0.2s ease',
          }}>→</span>
        </div>
      </div>
    </Link>
  )
}

/* ═══════════════════════════════════════════════════════════════ */
export default function Home() {
  const [master,  setMaster]  = useState<MasterResponse | null>(null)
  const [alerts,  setAlerts]  = useState<AlertsResponse | null>(null)
  const [ready,   setReady]   = useState(false)

  useEffect(() => {
    Promise.all([
      getMaster().then(setMaster).catch(() => {}),
      getAlerts().then(setAlerts).catch(() => {}),
    ]).finally(() => setReady(true))
  }, [])

  const avgScore   = master
    ? Math.round(master.departments.map(d => d.overall_score ?? 0).reduce((a, b) => a + b, 0) / (master.departments.length || 1))
    : 87
  const alertCount = alerts ? alerts.summary.red + alerts.summary.yellow : 3

  const domainAvgs = DOMAIN_META.map(dm => {
    if (!master) return { ...dm, avg: dm.mock }
    const vals = master.departments
      .map(d => d.domains[dm.code]?.score)
      .filter((v): v is number => v !== null && v !== undefined)
    return { ...dm, avg: vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : dm.mock }
  })

  const SPARKLINE = [72, 78, 81, 79, 84, 87]
  const kpis = [
    { value: 16,         suffix: '',  label: 'Отделов',     color: '#2196C9', spark: SPARKLINE },
    { value: 106,        suffix: '',  label: 'Сотрудников', color: '#1D9E75', spark: SPARKLINE },
    { value: avgScore,   suffix: '%', label: 'Средний KPI', color: '#F2994A', spark: SPARKLINE },
    { value: alertCount, suffix: '',  label: 'Алертов',     color: '#EB5757', spark: [3,5,2,4,2,alertCount] },
  ]

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', background: '#EEF4FA' }}>

      {/* ── Animated mesh background ───────────────────────── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '-10%', right: '-5%', width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(33,150,201,0.08) 0%, transparent 70%)',
          animation: 'mesh-float-1 25s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '5%', left: '-8%', width: 800, height: 800, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(12,68,124,0.05) 0%, transparent 70%)',
          animation: 'mesh-float-2 30s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', top: '35%', left: '40%', width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(29,158,117,0.04) 0%, transparent 70%)',
          animation: 'mesh-float-3 20s ease-in-out infinite',
        }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%) scale(2.14)', opacity: 0.06, transformOrigin: 'center', color: '#1C84C6' }}>
          <GeometricMotif variant="hero" className="crystal-spin-80" />
        </div>
      </div>

      {/* ── HERO ───────────────────────────────────────────── */}
      <section style={{
        position: 'relative', zIndex: 1,
        minHeight: 'calc(100vh - 52px)',
        display: 'flex', alignItems: 'center',
        padding: '60px 48px',
      }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 380px',
          gap: 64, alignItems: 'center', width: '100%', maxWidth: 1200,
        }}>

          {/* ── Left column ── */}
          <div>
            {/* LIVE badge */}
            <div className="card-enter" style={{ animationDelay: '0ms',
              display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 28,
              padding: '6px 14px', borderRadius: 100,
              background: 'rgba(28,132,198,0.1)', border: '1px solid rgba(28,132,198,0.25)',
            }}>
              <span className="live-dot" style={{
                width: 7, height: 7, borderRadius: '50%',
                background: '#1C84C6', flexShrink: 0, display: 'block',
              }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#1C84C6', letterSpacing: '0.04em' }}>LIVE</span>
              <span style={{ fontSize: 12, color: '#4A6580' }}>· Обновлено 2 мин назад</span>
            </div>

            {/* H1 */}
            <div className="card-enter" style={{ animationDelay: '80ms' }}>
              <h1 style={{ margin: 0, lineHeight: 1.05 }}>
                <span style={{ display: 'block', fontSize: 'clamp(44px,5vw,64px)',
                  fontFamily: "'Exo 2', sans-serif", fontWeight: 800, color: '#0D1B2A' }}>
                  Экосистема
                </span>
                <span style={{ display: 'block', fontSize: 'clamp(44px,5vw,64px)',
                  fontFamily: "'Exo 2', sans-serif", fontWeight: 900, color: '#1C84C6',
                  textShadow: '0 0 40px rgba(28,132,198,0.3)' }}>
                  СВЭП
                </span>
              </h1>
            </div>

            {/* Subtitle */}
            <p className="card-enter" style={{ animationDelay: '160ms',
              marginTop: 16, marginBottom: 40,
              fontSize: 16, color: '#4A6580', lineHeight: 1.5,
            }}>
              Система управления эффективностью · 16 отделов · 106 сотрудников
            </p>

            {/* KPI plaques */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
              {kpis.map((k, i) => (
                <div key={i} className="card-enter" style={{ animationDelay: `${240 + i * 80}ms`,
                  background: 'rgba(255,255,255,0.7)',
                  border: '1px solid rgba(28,132,198,0.15)',
                  borderTop: `2px solid ${k.color}`,
                  borderRadius: 16, padding: '20px 20px 16px',
                  WebkitBackdropFilter: 'blur(12px)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 4px 24px rgba(28,132,198,0.08)',
                }}>
                  <div style={{ fontSize: 40, fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 700, color: '#0D1B2A', lineHeight: 1 }}>
                    {ready
                      ? <CountUp value={k.value} suffix={k.suffix} duration={1500} delay={i * 120} />
                      : <span style={{ opacity: 0.3 }}>—</span>
                    }
                  </div>
                  <div style={{ marginTop: 6, marginBottom: 10, fontSize: 11, fontWeight: 600,
                    letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6B8AA8' }}>
                    {k.label}
                  </div>
                  <Sparkline data={k.spark} color={k.color} />
                </div>
              ))}
            </div>
          </div>

          {/* ── Right column — layered crystals ── */}
          <div className="crystal-group card-enter" style={{ animationDelay: '200ms',
            position: 'relative', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            height: 460,
          }}>
            <div style={{ position: 'absolute', opacity: 0.05, transform: 'scale(1.57)', transformOrigin: 'center', color: '#1C84C6' }}>
              <GeometricMotif variant="hero" className="crystal-spin-80" />
            </div>
            <div style={{ position: 'absolute', opacity: 0.12, transform: 'scale(1.36)', transformOrigin: 'center', color: '#1C84C6' }}>
              <GeometricMotif variant="hero" className="crystal-spin-rev" />
            </div>
            <div style={{ position: 'absolute', transform: 'scale(1.14)', transformOrigin: 'center', opacity: 0.5, color: '#1C84C6' }}>
              <GeometricMotif variant="hero" className="crystal-spin" />
            </div>
          </div>

        </div>
      </section>

      {/* ── DOMAIN SECTION ─────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 48px 100px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          <div className="card-enter" style={{ marginBottom: 48 }}>
            <h2 style={{ margin: 0, fontSize: 'clamp(28px,3vw,36px)',
              fontFamily: "'Exo 2', sans-serif", fontWeight: 700,
              color: '#0D1B2A', letterSpacing: '-0.01em' }}>
              6 направлений эффективности
            </h2>
            <p style={{ margin: '8px 0 0', fontSize: 15, color: '#4A6580' }}>
              Lean-система управления производительностью СВЭП
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {domainAvgs.map((d, i) => (
              <DomainCard key={d.code} domain={d} index={i} />
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
