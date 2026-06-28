import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMaster, getAlerts } from '@/api'
import type { MasterResponse, AlertsResponse } from '@/types'
import GeometricMotif from '@/components/GeometricMotif'
import ParticleField from '@/components/ParticleField'
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
      <path d={d} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.8} />
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

/* ── Domain Card (dark) ───────────────────────────────────────── */
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
        background: hovered ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
        border: hovered ? `1px solid ${domain.color}55` : '1px solid rgba(255,255,255,0.07)',
        borderRadius: 20, padding: 28,
        WebkitBackdropFilter: 'blur(12px)',
        backdropFilter: 'blur(12px)',
        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered
          ? `0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px ${domain.color}22`
          : '0 2px 16px rgba(0,0,0,0.2)',
        cursor: 'pointer',
        height: '100%',
        boxSizing: 'border-box' as const,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 600,
            color: 'rgba(255,255,255,0.2)', letterSpacing: '0.05em' }}>
            {String(index + 1).padStart(2, '0')}
          </span>
          <DomainIcon code={domain.code} color={domain.color} />
        </div>

        <div style={{ fontSize: 17, fontFamily: "'Exo 2', sans-serif", fontWeight: 600,
          color: 'rgba(255,255,255,0.9)', marginBottom: 6 }}>
          {domain.label}
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5,
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
          {domain.desc}
        </div>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '16px 0' }} />

        <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 2,
            width: `${domain.avg}%`,
            background: `linear-gradient(90deg, ${domain.color}88, ${domain.color})`,
            transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)',
          }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, color: domain.color }}>
            {domain.avg}%
          </span>
          <span style={{
            fontSize: 14, color: 'rgba(255,255,255,0.25)',
            transform: hovered ? 'translateX(4px)' : 'translateX(0)',
            transition: 'transform 0.2s ease',
          }}>→</span>
        </div>
      </div>
    </Link>
  )
}

/* ── Parallax crystal group ───────────────────────────────────── */
function CrystalHero({ mouseX, mouseY }: { mouseX: number; mouseY: number }) {
  const px = (mouseX - 0.5) * 18
  const py = (mouseY - 0.5) * 12

  return (
    <div style={{
      position: 'relative', width: 340, height: 420,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* glow */}
      <div style={{
        position: 'absolute', width: 280, height: 280, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(33,150,201,0.18) 0%, transparent 70%)',
        filter: 'blur(40px)',
        transform: `translate(${px * 0.3}px, ${py * 0.3}px)`,
        transition: 'transform 0.6s ease',
      }} />

      {/* outermost ring — slowest parallax */}
      <div style={{
        position: 'absolute',
        transform: `translate(${px * 0.4}px, ${py * 0.4}px)`,
        transition: 'transform 0.5s ease',
        opacity: 0.06,
      }}>
        <GeometricMotif variant="hero" color="#1C84C6" size={448} className="crystal-spin-80" />
      </div>

      {/* mid ring */}
      <div style={{
        position: 'absolute',
        transform: `translate(${px * 0.65}px, ${py * 0.65}px)`,
        transition: 'transform 0.4s ease',
        opacity: 0.14,
      }}>
        <GeometricMotif variant="hero" color="#1C84C6" size={342} className="crystal-spin-rev" />
      </div>

      {/* inner crystal — full opacity, fastest parallax */}
      <div style={{
        position: 'absolute',
        transform: `translate(${px}px, ${py}px)`,
        transition: 'transform 0.25s ease',
        opacity: 0.72,
        filter: 'drop-shadow(0 0 16px rgba(33,150,201,0.5))',
      }}>
        <GeometricMotif variant="hero" color="#2196C9" size={280} className="crystal-spin" />
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════ */
export default function Home() {
  const [master,  setMaster]  = useState<MasterResponse | null>(null)
  const [alerts,  setAlerts]  = useState<AlertsResponse | null>(null)
  const [ready,   setReady]   = useState(false)
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 })
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    Promise.all([
      getMaster().then(setMaster).catch(() => {}),
      getAlerts().then(setAlerts).catch(() => {}),
    ]).finally(() => setReady(true))
  }, [])

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = heroRef.current?.getBoundingClientRect()
    if (!rect) return
    setMouse({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    })
  }

  const deptCount  = master ? master.departments.length : 15
  const avgScoreRaw = master
    ? Math.round(master.departments.map(d => d.overall_score ?? 0).reduce((a, b) => a + b, 0) / (master.departments.length || 1))
    : 0
  const avgScore   = avgScoreRaw > 0 ? avgScoreRaw : 87
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
    { value: deptCount,  suffix: '',  label: 'Отделов',     color: '#2196C9', spark: SPARKLINE },
    { value: 106,        suffix: '',  label: 'Сотрудников', color: '#1D9E75', spark: SPARKLINE },
    { value: avgScore,   suffix: '%', label: 'Средний KPI', color: '#F2994A', spark: SPARKLINE },
    { value: alertCount, suffix: '',  label: 'Сигналов',    color: '#EB5757', spark: [3,5,2,4,2,alertCount] },
  ]

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', background: '#060A14' }}>

      {/* ── Particle field ──────────────────────────────────── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <ParticleField count={260} attractX={0.62} attractY={0.32} />
      </div>

      {/* ── Radial accent glow ──────────────────────────────── */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 80% 60% at 62% 32%, rgba(28,132,198,0.09) 0%, transparent 70%)',
      }} />

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        onMouseMove={handleMouseMove}
        style={{
          position: 'relative', zIndex: 1,
          minHeight: 'calc(100vh - 52px)',
          display: 'flex', alignItems: 'center',
          padding: '60px 48px',
        }}
      >
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 380px',
          gap: 64, alignItems: 'center', width: '100%', maxWidth: 1200,
        }}>

          {/* ── Left column ── */}
          <div>
            {/* eyebrow */}
            <div className="card-enter" style={{ animationDelay: '0ms',
              display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 28,
              padding: '6px 14px', borderRadius: 100,
              background: 'rgba(33,150,201,0.12)', border: '1px solid rgba(33,150,201,0.25)',
            }}>
              <span className="live-dot" style={{
                width: 7, height: 7, borderRadius: '50%',
                background: '#2196C9', flexShrink: 0, display: 'block',
              }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#5BB8E8', letterSpacing: '0.04em' }}>LIVE</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>· Обновлено 2 мин назад</span>
            </div>

            {/* H1 */}
            <div className="card-enter" style={{ animationDelay: '80ms' }}>
              <h1 style={{ margin: 0, lineHeight: 1.05 }}>
                <span style={{
                  display: 'block', fontSize: 'clamp(44px,5vw,64px)',
                  fontFamily: "'Exo 2', sans-serif", fontWeight: 200,
                  color: 'rgba(255,255,255,0.55)', letterSpacing: '0.04em',
                }}>
                  Экосистема
                </span>
                <span style={{
                  display: 'block', fontSize: 'clamp(52px,6vw,80px)',
                  fontFamily: "'Exo 2', sans-serif", fontWeight: 900,
                  background: 'linear-gradient(135deg, #5BB8E8 0%, #2196C9 40%, #1D9E75 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '-0.01em',
                }}>
                  СВЭП
                </span>
              </h1>
            </div>

            {/* Subtitle */}
            <p className="card-enter" style={{ animationDelay: '160ms',
              marginTop: 16, marginBottom: 40,
              fontSize: 16, color: 'rgba(255,255,255,0.38)', lineHeight: 1.6,
            }}>
              Система управления эффективностью · {deptCount} отделов · 106 сотрудников
            </p>

            {/* KPI plaques */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
              {kpis.map((k, i) => (
                <div key={i} className="card-enter" style={{ animationDelay: `${240 + i * 80}ms`,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderTop: `2px solid ${k.color}`,
                  borderRadius: 16, padding: '20px 20px 16px',
                  WebkitBackdropFilter: 'blur(16px)',
                  backdropFilter: 'blur(16px)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                }}>
                  <div style={{
                    fontSize: 40, fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 200, color: 'rgba(255,255,255,0.92)', lineHeight: 1,
                  }}>
                    {ready
                      ? <CountUp value={k.value} suffix={k.suffix} duration={1500} delay={i * 120} />
                      : <span style={{ opacity: 0.2 }}>—</span>
                    }
                  </div>
                  <div style={{ marginTop: 6, marginBottom: 10, fontSize: 11, fontWeight: 600,
                    letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)' }}>
                    {k.label}
                  </div>
                  <Sparkline data={k.spark} color={k.color} />
                </div>
              ))}
            </div>
          </div>

          {/* ── Right column — parallax crystal ── */}
          <div className="card-enter" style={{ animationDelay: '200ms',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CrystalHero mouseX={mouse.x} mouseY={mouse.y} />
          </div>

        </div>
      </section>

      {/* ── DOMAIN SECTION ──────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 48px 100px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          <div className="card-enter" style={{ marginBottom: 48 }}>
            <h2 style={{ margin: 0, fontSize: 'clamp(26px,3vw,34px)',
              fontFamily: "'Exo 2', sans-serif", fontWeight: 700,
              color: 'rgba(255,255,255,0.88)', letterSpacing: '-0.01em' }}>
              6 направлений эффективности
            </h2>
            <p style={{ margin: '8px 0 0', fontSize: 15, color: 'rgba(255,255,255,0.35)' }}>
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
