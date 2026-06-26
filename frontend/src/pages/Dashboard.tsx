import { useEffect, useState, useRef } from 'react'
import { getMaster, getAlerts, getCompanyTrends } from '@/api'
import type { MasterResponse, AlertsResponse, TrendPoint } from '@/types'
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'
import ScoreCell from '@/components/ui/ScoreCell'

const SLIDE_INTERVAL = 12_000
const DATA_INTERVAL  = 60_000

type Slide = 'heatmap' | 'top' | 'alerts' | 'trend'
const SLIDES: Slide[] = ['heatmap', 'alerts', 'top', 'trend']

function Clock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(iv)
  }, [])
  return (
    <div className="text-right">
      <div className="mono-num text-2xl font-medium tabular-nums text-svep-accent">
        {now.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </div>
      <div className="eyebrow mt-0.5" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 11 }}>
        {now.toLocaleDateString('ru', { weekday: 'short', day: 'numeric', month: 'long' })}
      </div>
    </div>
  )
}

function ProgressBar({ value, max, className = '' }: { value: number; max: number; className?: string }) {
  const pct = max > 0 ? Math.min(value / max * 100, 100) : 0
  return (
    <div className={`h-0.5 bg-svep-border overflow-hidden ${className}`}>
      <div className="h-full transition-all duration-1000" style={{ width: `${pct}%`, backgroundColor: 'var(--accent)' }} />
    </div>
  )
}

export default function Dashboard() {
  const [master,    setMaster]    = useState<MasterResponse | null>(null)
  const [alerts,    setAlerts]    = useState<AlertsResponse | null>(null)
  const [trends,    setTrends]    = useState<TrendPoint[]>([])
  const [slide,     setSlide]     = useState<Slide>('heatmap')
  const [_slideIdx, setSlideIdx]  = useState(0)
  const [slideTime, setSlideTime] = useState(0)
  const [tvMode,    setTvMode]    = useState(false)
  const [autoPlay,  setAutoPlay]  = useState(true)
  const slideTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  const loadData = () => {
    getMaster().then(setMaster)
    getAlerts().then(setAlerts).catch(() => {})
    getCompanyTrends(12).then(d => setTrends(d.points)).catch(() => {})
  }

  useEffect(() => {
    loadData()
    const iv = setInterval(loadData, DATA_INTERVAL)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    if (!autoPlay) { if (slideTimer.current) clearInterval(slideTimer.current); return }
    const tick = 100; let elapsed = 0
    slideTimer.current = setInterval(() => {
      elapsed += tick
      setSlideTime(elapsed / SLIDE_INTERVAL * 100)
      if (elapsed >= SLIDE_INTERVAL) {
        elapsed = 0
        setSlideIdx(i => { const next = (i + 1) % SLIDES.length; setSlide(SLIDES[next]); return next })
      }
    }, tick)
    return () => { if (slideTimer.current) clearInterval(slideTimer.current) }
  }, [autoPlay])

  const goSlide = (idx: number) => { setSlideIdx(idx); setSlide(SLIDES[idx]); setSlideTime(0) }

  const avgScore = master ? Math.round(master.departments.map(d => d.overall_score ?? 0).reduce((a, b) => a + b, 0) / (master.departments.length || 1)) : null
  const green  = master?.departments.filter(d => (d.overall_score ?? 0) >= 80).length ?? 0
  const red    = master?.departments.filter(d => (d.overall_score ?? 100) < 60).length ?? 0
  const sorted = master ? [...master.departments].sort((a, b) => (b.overall_score ?? 0) - (a.overall_score ?? 0)) : []
  const chartTrends = trends.map(t => ({ name: t.label, score: t.score }))

  return (
    <div className={`bg-svep-bg flex flex-col ${tvMode ? 'fixed inset-0 z-[100]' : 'min-h-full'}`}>
      <header className="flex items-center justify-between px-6 py-3 bg-svep-surface border-b border-svep-border shrink-0">
        <div className="flex items-center gap-3">
          <div>
            <div className="font-brutal font-black text-base text-svep-primary">Экосистема СВЭП</div>
            <div className="eyebrow mt-0.5" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 10 }}>
              ООО «Средневолжскэлектропроект» · Публичный режим
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 text-center">
          <div>
            <div className={`mono-num text-2xl font-medium tabular-nums ${avgScore !== null ? (avgScore >= 80 ? 'text-green-600' : avgScore >= 60 ? 'text-amber-600' : 'text-red-600') : 'text-svep-tertiary'}`}>
              {avgScore ?? '…'}%
            </div>
            <div className="eyebrow mt-0.5" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 10 }}>Ср. KPI</div>
          </div>
          <div>
            <div className="mono-num text-2xl font-medium text-green-600">{green}</div>
            <div className="eyebrow mt-0.5" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 10 }}>Зелёных</div>
          </div>
          <div>
            <div className="mono-num text-2xl font-medium text-red-600">{red}</div>
            <div className="eyebrow mt-0.5" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 10 }}>Тревога</div>
          </div>
          {alerts && (
            <div>
              <div className="mono-num text-2xl font-medium text-amber-600">{alerts.summary.red + alerts.summary.yellow}</div>
              <div className="eyebrow mt-0.5" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 10 }}>Сигналов</div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Clock />
          <button onClick={() => setTvMode(v => !v)} className="text-svep-tertiary hover:text-svep-accent transition-colors text-lg px-2">
            📺
          </button>
        </div>
      </header>

      <div className="flex items-center gap-1 px-6 py-2 bg-svep-surface border-b border-svep-border shrink-0">
        {SLIDES.map((s, i) => {
          const labels: Record<Slide, string> = { heatmap: 'Тепловая карта', alerts: 'Сигналы', top: 'Рейтинг', trend: 'Тренд' }
          return (
            <button key={s} onClick={() => goSlide(i)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors uppercase tracking-wider ${
                slide === s ? 'text-svep-accent bg-svep-accent-light' : 'text-svep-secondary hover:text-svep-primary'
              }`}>
              {labels[s]}
            </button>
          )
        })}
        <div className="flex-1" />
        <button onClick={() => setAutoPlay(v => !v)}
          className={`text-xs px-2 py-1 rounded transition-colors ${autoPlay ? 'text-svep-accent' : 'text-svep-tertiary'}`}>
          {autoPlay ? '⏸' : '▶'}
        </button>
      </div>
      {autoPlay && <ProgressBar value={slideTime} max={100} />}

      <div className="flex-1 overflow-auto p-6">
        {slide === 'heatmap' && master && (
          <div className="h-full flex flex-col">
            <p className="eyebrow mb-4">Тепловая карта — {master.departments.length} отделов × {master.domains.length} доменов</p>
            <div className="overflow-x-auto flex-1">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-svep-border">
                    <th className="text-left p-2 w-20 eyebrow" style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 500 }}>Отдел</th>
                    {master.domains.map(d => (
                      <th key={d.code} className="text-center p-2 min-w-[70px]">
                        <div className="text-lg">{d.icon}</div>
                        <div className="eyebrow" style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>{d.name_ru}</div>
                      </th>
                    ))}
                    <th className="text-center p-2 min-w-[70px] eyebrow" style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>Итог</th>
                  </tr>
                </thead>
                <tbody>
                  {master.departments.map(dept => (
                    <tr key={dept.id} className="border-b border-svep-border hover:bg-gray-50">
                      <td className="p-2">
                        <div className="text-xs font-bold text-svep-primary">{dept.name_short}</div>
                        <div className="text-[9px] text-svep-tertiary">{dept.staff_count}ч</div>
                      </td>
                      {master.domains.map(dom => (
                        <td key={dom.code} className="p-0.5">
                          <ScoreCell score={dept.domains[dom.code]?.score ?? null} className="h-10 w-full text-[10px]" />
                        </td>
                      ))}
                      <td className="p-0.5">
                        <ScoreCell score={dept.overall_score} className="h-10 w-full font-extrabold text-[11px]" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {slide === 'alerts' && (
          <div>
            <p className="eyebrow mb-4">Критичные и предупреждающие KPI</p>
            {!alerts ? (
              <div className="text-svep-tertiary text-center py-12">Загрузка…</div>
            ) : alerts.alerts.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-3">✅</div>
                <div className="font-brutal font-black text-xl text-svep-primary">Всё в норме</div>
                <div className="text-svep-secondary mt-1">Критичных показателей нет</div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {alerts.alerts.slice(0, 16).map(a => (
                  <div key={a.indicator_id}
                    className={`rounded-xl p-4 border ${a.status === 'red' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-svep-secondary">{a.dept_name}</span>
                      <span className="text-xs">{a.domain_icon}</span>
                    </div>
                    <div className="text-svep-primary text-sm font-medium line-clamp-2">{a.name}</div>
                    <div className={`mono-num text-xl font-medium mt-2 ${a.status === 'red' ? 'text-red-600' : 'text-amber-600'}`}>
                      {a.actual ?? '—'} {a.unit}
                    </div>
                    <div className="text-svep-tertiary text-xs">цель: {a.target} {a.unit}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {slide === 'top' && master && (
          <div>
            <p className="eyebrow mb-4">Рейтинг отделов по суммарному KPI</p>
            <div className="grid md:grid-cols-2 gap-3 max-w-3xl">
              {sorted.map((dept, i) => {
                const score = dept.overall_score ?? 0
                const barColor = score >= 80 ? 'var(--accent)' : score >= 60 ? '#D97706' : '#DC2626'
                return (
                  <div key={dept.id} className="flex items-center gap-3 bg-svep-surface border border-svep-border rounded-xl px-4 py-3">
                    <span className="mono-num text-svep-tertiary w-8 text-right text-sm shrink-0">
                      {i < 3 ? ['🥇','🥈','🥉'][i] : `${i+1}`}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-svep-primary text-sm">{dept.name_short}</span>
                        <span className="mono-num font-medium text-sm tabular-nums" style={{ color: barColor }}>
                          {dept.overall_score ?? '—'}%
                        </span>
                      </div>
                      <div className="h-1 bg-svep-border rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: barColor }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {slide === 'trend' && (
          <div>
            <p className="eyebrow mb-4">Динамика KPI предприятия за 12 месяцев</p>
            {chartTrends.length === 0 ? (
              <div className="text-svep-tertiary text-center py-12">Загрузка…</div>
            ) : (
              <div className="bg-svep-surface border border-svep-border rounded-xl p-6">
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={chartTrends}>
                    <Tooltip
                      contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}
                      labelStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
                      formatter={(v: any) => [`${v}%`, 'KPI']}
                    />
                    <Line type="monotone" dataKey="score" stroke="var(--accent)" strokeWidth={2.5}
                      dot={{ r: 4, fill: 'var(--accent)', strokeWidth: 0 }} activeDot={{ r: 6 }} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="px-6 py-2 bg-svep-surface border-t border-svep-border flex items-center justify-between shrink-0">
        <span className="eyebrow" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 10 }}>
          15 отделов · 106 сотрудников · Проектирование 0.4–220 кВ
        </span>
        <span className="eyebrow" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 10 }}>
          Авто-обновление каждую минуту
        </span>
      </footer>
    </div>
  )
}
