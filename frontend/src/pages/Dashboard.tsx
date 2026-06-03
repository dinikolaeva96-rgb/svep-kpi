import { useEffect, useState, useRef } from 'react'
import { getMaster, getAlerts, getCompanyTrends } from '@/api'
import type { MasterResponse, AlertsResponse, TrendPoint } from '@/types'
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'
import ScoreCell from '@/components/ui/ScoreCell'

const SLIDE_INTERVAL = 12_000   // ms per slide
const DATA_INTERVAL  = 60_000   // ms data refresh

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
      <div className="text-2xl font-mono font-bold text-amber-400 tabular-nums">
        {now.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </div>
      <div className="text-xs text-gray-500">
        {now.toLocaleDateString('ru', { weekday: 'short', day: 'numeric', month: 'long' })}
      </div>
    </div>
  )
}

function ProgressBar({ value, max, className = '' }: { value: number; max: number; className?: string }) {
  const pct = max > 0 ? Math.min(value / max * 100, 100) : 0
  return (
    <div className={`h-1.5 bg-gray-800 rounded-full overflow-hidden ${className}`}>
      <div
        className="h-full bg-blue-500 rounded-full transition-all duration-1000"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export default function Dashboard() {
  const [master,    setMaster]    = useState<MasterResponse | null>(null)
  const [alerts,    setAlerts]    = useState<AlertsResponse | null>(null)
  const [trends,    setTrends]    = useState<TrendPoint[]>([])
  const [slide,     setSlide]     = useState<Slide>('heatmap')
  const [slideIdx,  setSlideIdx]  = useState(0)
  const [slideTime, setSlideTime] = useState(0)  // progress 0–100
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

  // Авто-ротация слайдов
  useEffect(() => {
    if (!autoPlay) {
      if (slideTimer.current) clearInterval(slideTimer.current)
      return
    }
    const tick = 100
    let elapsed = 0
    slideTimer.current = setInterval(() => {
      elapsed += tick
      setSlideTime(elapsed / SLIDE_INTERVAL * 100)
      if (elapsed >= SLIDE_INTERVAL) {
        elapsed = 0
        setSlideIdx(i => {
          const next = (i + 1) % SLIDES.length
          setSlide(SLIDES[next])
          return next
        })
      }
    }, tick)
    return () => { if (slideTimer.current) clearInterval(slideTimer.current) }
  }, [autoPlay])

  const goSlide = (idx: number) => {
    setSlideIdx(idx)
    setSlide(SLIDES[idx])
    setSlideTime(0)
  }

  const avgScore = master
    ? Math.round(master.departments.map(d => d.overall_score ?? 0).reduce((a, b) => a + b, 0) / (master.departments.length || 1))
    : null

  const green  = master?.departments.filter(d => (d.overall_score ?? 0) >= 80).length ?? 0
  const red    = master?.departments.filter(d => (d.overall_score ?? 100) < 60).length ?? 0
  const sorted = master ? [...master.departments].sort((a, b) => (b.overall_score ?? 0) - (a.overall_score ?? 0)) : []

  const chartTrends = trends.map(t => ({ name: t.label, score: t.score }))

  return (
    <div className={`bg-gray-950 flex flex-col ${tvMode ? 'fixed inset-0 z-[100]' : 'min-h-screen pt-16'}`}>
      {/* Шапка */}
      <header className="flex items-center justify-between px-6 py-3 bg-gray-900/80 border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚡</span>
          <div>
            <div className="text-base font-bold text-white leading-tight">Экосистема СВЭП</div>
            <div className="text-[11px] text-gray-500">ООО «Средневолжскэлектропроект» · Публичный режим</div>
          </div>
        </div>

        {/* Глобальные метрики */}
        <div className="hidden md:flex items-center gap-6 text-center">
          <div>
            <div className={`text-2xl font-bold tabular-nums ${avgScore !== null ? (avgScore >= 80 ? 'text-green-400' : avgScore >= 60 ? 'text-yellow-400' : 'text-red-400') : 'text-gray-500'}`}>
              {avgScore ?? '…'}%
            </div>
            <div className="text-[10px] text-gray-500">Ср. KPI</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">{green}</div>
            <div className="text-[10px] text-gray-500">Зелёных</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-400">{red}</div>
            <div className="text-[10px] text-gray-500">Тревога</div>
          </div>
          {alerts && (
            <div>
              <div className="text-2xl font-bold text-yellow-400">{alerts.summary.red + alerts.summary.yellow}</div>
              <div className="text-[10px] text-gray-500">Алертов</div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Clock />
          <button
            onClick={() => setTvMode(v => !v)}
            title={tvMode ? 'Выйти из TV-режима' : 'TV-режим'}
            className="text-gray-500 hover:text-white transition-colors text-lg px-2"
          >
            {tvMode ? '⛶' : '⛶'}📺
          </button>
        </div>
      </header>

      {/* Навигация слайдов */}
      <div className="flex items-center gap-1 px-6 py-2 bg-gray-900/50 border-b border-gray-800 shrink-0">
        {SLIDES.map((s, i) => {
          const labels: Record<Slide, string> = {
            heatmap: '🟦 Тепловая карта',
            alerts:  '🚨 Алерты',
            top:     '🏆 Рейтинг',
            trend:   '📈 Тренд',
          }
          return (
            <button
              key={s}
              onClick={() => goSlide(i)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                slide === s ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-white hover:bg-gray-800'
              }`}
            >
              {labels[s]}
            </button>
          )
        })}
        <div className="flex-1" />
        <button
          onClick={() => setAutoPlay(v => !v)}
          className={`text-xs px-2 py-1 rounded transition-colors ${autoPlay ? 'text-green-400 bg-green-900/20' : 'text-gray-500'}`}
        >
          {autoPlay ? '⏸ Авто' : '▶ Авто'}
        </button>
      </div>
      {autoPlay && <ProgressBar value={slideTime} max={100} />}

      {/* Основной контент */}
      <div className="flex-1 overflow-auto p-4">

        {/* === СЛАЙД: Тепловая карта 16×6 === */}
        {slide === 'heatmap' && master && (
          <div className="h-full flex flex-col">
            <div className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wider">
              Тепловая карта — {master.departments.length} отделов × {master.domains.length} доменов
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left text-gray-500 font-medium p-1.5 text-xs w-20">Отдел</th>
                    {master.domains.map(d => (
                      <th key={d.code} className="text-center p-1.5 min-w-[70px]">
                        <div className="text-lg">{d.icon}</div>
                        <div className="text-[9px] text-gray-500 leading-tight">{d.name_ru}</div>
                      </th>
                    ))}
                    <th className="text-center p-1.5 min-w-[70px]">
                      <div className="text-lg">⭐</div>
                      <div className="text-[9px] text-gray-500">Итог</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {master.departments.map(dept => (
                    <tr key={dept.id} className="border-t border-gray-800/50">
                      <td className="p-1.5">
                        <div className="text-xs font-bold text-white">{dept.name_short}</div>
                        <div className="text-[9px] text-gray-600">{dept.staff_count}ч</div>
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

        {/* === СЛАЙД: Алерты === */}
        {slide === 'alerts' && (
          <div>
            <div className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wider">
              Критичные и предупреждающие KPI
            </div>
            {!alerts ? (
              <div className="text-gray-600 text-center py-12">Загрузка…</div>
            ) : alerts.alerts.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-3">✅</div>
                <div className="text-xl text-white font-semibold">Всё в норме</div>
                <div className="text-gray-500 mt-1">Критичных показателей нет</div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {alerts.alerts.slice(0, 16).map(a => (
                  <div
                    key={a.indicator_id}
                    className={`rounded-xl p-4 border ${
                      a.status === 'red'
                        ? 'bg-red-500/10 border-red-500/30'
                        : 'bg-yellow-500/10 border-yellow-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400">{a.dept_name}</span>
                      <span className="text-xs">{a.domain_icon}</span>
                    </div>
                    <div className="text-white text-sm font-medium line-clamp-2">{a.name}</div>
                    <div className={`text-xl font-bold mt-2 ${a.status === 'red' ? 'text-red-400' : 'text-yellow-400'}`}>
                      {a.actual ?? '—'} {a.unit}
                    </div>
                    <div className="text-gray-500 text-xs">цель: {a.target} {a.unit}</div>
                    {a.trend !== 'stable' && (
                      <div className={`text-xs mt-1 ${a.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                        {a.trend === 'up' ? '↑ растёт' : '↓ снижается'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* === СЛАЙД: Рейтинг === */}
        {slide === 'top' && master && (
          <div>
            <div className="text-xs text-gray-500 mb-4 font-medium uppercase tracking-wider">
              Рейтинг отделов по суммарному KPI
            </div>
            <div className="grid md:grid-cols-2 gap-3 max-w-3xl">
              {sorted.map((dept, i) => {
                const score = dept.overall_score ?? 0
                const barColor = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                return (
                  <div key={dept.id} className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
                    <span className="text-2xl font-bold text-gray-700 w-8 text-right shrink-0">
                      {i < 3 ? ['🥇','🥈','🥉'][i] : `${i+1}`}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white text-sm">{dept.name_short}</span>
                        <span className={`font-bold text-sm tabular-nums ${score >= 80 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {dept.overall_score ?? '—'}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div className={`h-full ${barColor} transition-all`} style={{ width: `${score}%` }} />
                      </div>
                      <div className="text-[10px] text-gray-600 mt-0.5">{dept.staff_count} сотр.</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* === СЛАЙД: Тренд === */}
        {slide === 'trend' && (
          <div>
            <div className="text-xs text-gray-500 mb-4 font-medium uppercase tracking-wider">
              Динамика KPI предприятия за 12 месяцев
            </div>
            {chartTrends.length === 0 ? (
              <div className="text-gray-600 text-center py-12">Загрузка…</div>
            ) : (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={chartTrends}>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8 }}
                      labelStyle={{ color: '#F9FAFB', fontWeight: 600 }}
                      formatter={(v: any) => [`${v}%`, 'KPI']}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#60A5FA"
                      strokeWidth={3}
                      dot={{ r: 5, fill: '#60A5FA', strokeWidth: 0 }}
                      activeDot={{ r: 7 }}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 mt-3">
                  {chartTrends.map(p => (
                    <div key={p.name} className="text-center">
                      <div className={`text-xs font-bold tabular-nums ${
                        !p.score ? 'text-gray-600'
                        : p.score >= 80 ? 'text-green-400'
                        : p.score >= 60 ? 'text-yellow-400' : 'text-red-400'
                      }`}>{p.score ?? '—'}%</div>
                      <div className="text-[9px] text-gray-600">{p.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Нижняя строка */}
      <footer className="px-6 py-2 bg-gray-900/60 border-t border-gray-800 flex items-center justify-between text-[10px] text-gray-600 shrink-0">
        <span>16 отделов · 106 сотрудников · Проектирование 0.4–220 кВ</span>
        <span>Авто-обновление каждую минуту</span>
      </footer>
    </div>
  )
}
