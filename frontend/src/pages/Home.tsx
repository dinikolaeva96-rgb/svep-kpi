import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMaster, getCompanyTrends, getAlerts } from '@/api'
import type { MasterResponse, TrendPoint, AlertsResponse } from '@/types'
import AlertBanner from '@/components/ui/AlertBanner'
import Sparkline   from '@/components/charts/Sparkline'

const DOMAIN_META = [
  { code: 'quality',    icon: '🏆', label: 'Качество' },
  { code: 'delivery',   icon: '⏱️', label: 'Сроки' },
  { code: 'cost',       icon: '💰', label: 'Затраты' },
  { code: 'safety',     icon: '🛡️', label: 'Безопасность' },
  { code: 'morale',     icon: '❤️', label: 'Вовлечённость' },
  { code: 'innovation', icon: '💡', label: 'Инновации' },
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

  const totalDepts = master?.departments.length ?? 0

  const avgScore = master
    ? Math.round(
        master.departments.map(d => d.overall_score ?? 0).reduce((a, b) => a + b, 0) / (master.departments.length || 1)
      )
    : null

  // Тренд: сравниваем последние два периода
  const trendDir = trends.length >= 2
    ? ((trends[trends.length - 1].score ?? 0) - (trends[trends.length - 2].score ?? 0))
    : 0
  const trendIcon  = trendDir > 0 ? '↑' : trendDir < 0 ? '↓' : '→'
  const trendColor = trendDir > 0 ? 'text-green-400' : trendDir < 0 ? 'text-red-400' : 'text-gray-500'

  const domainAvgs = master
    ? DOMAIN_META.map(dm => {
        const vals = master.departments
          .map(d => d.domains[dm.code]?.score)
          .filter((v): v is number => v !== null && v !== undefined)
        return { ...dm, avg: vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null }
      })
    : DOMAIN_META.map(dm => ({ ...dm, avg: null }))

  const sparkData = trends.map(t => ({ value: t.score }))

  return (
    <div className="pt-20 px-4 max-w-screen-xl mx-auto">
      <AlertBanner />

      {/* Hero */}
      <section className="py-10 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-900/30 border border-blue-700/40 rounded-full px-4 py-1.5 text-blue-300 text-sm mb-6">
          <span>⚡</span> ООО «Средневолжскэлектропроект» · Казань
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
          Экосистема <span className="text-amber-400">СВЭП</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
          KPI-портал для {totalDepts} отделов, {106} сотрудников.&nbsp;
          Проектирование электросетей 0.4–220 кВ.
        </p>

        {/* Hero metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-4">
          {[
            { label: 'Отделов',         value: '16' },
            { label: 'Сотрудников',     value: '106' },
            {
              label: 'Средний KPI',
              value: avgScore !== null ? `${avgScore}%` : '…',
              extra: trendIcon,
              extraCls: trendColor,
            },
            {
              label: 'Алертов',
              value: alerts ? String(alerts.summary.red + alerts.summary.yellow) : '…',
              extraCls: (alerts?.summary.red ?? 0) > 0 ? 'text-red-400' : 'text-yellow-400',
            },
          ].map(m => (
            <div key={m.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex items-baseline justify-center gap-1.5">
                <div className="text-2xl font-bold text-white">{m.value}</div>
                {m.extra && <span className={`text-base font-bold ${m.extraCls}`}>{m.extra}</span>}
              </div>
              <div className="text-xs text-gray-500 mt-1">{m.label}</div>
            </div>
          ))}
        </div>

        {/* Спарклайн тренда */}
        {sparkData.length > 1 && (
          <div className="max-w-2xl mx-auto mb-8 px-4">
            <div className="text-xs text-gray-600 mb-1 text-left">Тренд KPI (последние {sparkData.length} месяцев)</div>
            <Sparkline data={sparkData} height={48} color={trendDir >= 0 ? '#22C55E' : '#EF4444'} />
          </div>
        )}
      </section>

      {/* 6 доменов */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-200">6 lean-доменов</h2>
          <Link to="/master" className="text-sm text-blue-400 hover:text-blue-300">Мастер-карта →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {domainAvgs.map(d => (
            <Link
              key={d.code}
              to={`/domain/${d.code}`}
              className="group bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl p-5 text-center transition-all hover:-translate-y-1"
            >
              <div className="text-3xl mb-3">{d.icon}</div>
              <div className="text-sm font-medium text-gray-300 group-hover:text-white">{d.label}</div>
              {d.avg !== null ? (
                <div className={`text-lg font-bold mt-2 ${d.avg >= 80 ? 'text-green-400' : d.avg >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {d.avg}%
                </div>
              ) : (
                <div className="text-gray-600 mt-2">—</div>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* Быстрые действия */}
      <section className="mb-12 grid sm:grid-cols-3 gap-4">
        <Link to="/alerts" className="group bg-red-900/20 border border-red-800/40 hover:border-red-600/60 rounded-xl p-5 transition-all">
          <div className="text-2xl mb-2">🚨</div>
          <div className="font-semibold text-white group-hover:text-red-300">Алерты</div>
          <div className="text-sm text-gray-500 mt-1">
            {alerts ? `${alerts.summary.red + alerts.summary.yellow} показателей вне нормы` : 'Загрузка…'}
          </div>
        </Link>
        <Link to="/kaizen" className="group bg-blue-900/20 border border-blue-800/40 hover:border-blue-600/60 rounded-xl p-5 transition-all">
          <div className="text-2xl mb-2">💡</div>
          <div className="font-semibold text-white group-hover:text-blue-300">Кайдзен</div>
          <div className="text-sm text-gray-500 mt-1">Предложения по улучшению</div>
        </Link>
        <Link to="/dashboard" className="group bg-purple-900/20 border border-purple-800/40 hover:border-purple-600/60 rounded-xl p-5 transition-all">
          <div className="text-2xl mb-2">📺</div>
          <div className="font-semibold text-white group-hover:text-purple-300">TV-дашборд</div>
          <div className="text-sm text-gray-500 mt-1">Публичный экран с авто-ротацией</div>
        </Link>
      </section>

      {/* Отделы */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-200">Отделы</h2>
        </div>
        {loading ? (
          <div className="text-gray-500 text-center py-12">Загрузка…</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {master?.departments.map(dept => {
              const score = dept.overall_score
              const color = score === null ? 'text-gray-500'
                : score >= 80 ? 'text-green-400'
                : score >= 60 ? 'text-yellow-400'
                : 'text-red-400'
              const hasAlert = alerts?.alerts.some(a => a.dept_id === dept.id)
              return (
                <Link
                  key={dept.id}
                  to={`/dept/${dept.id}`}
                  className="bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl p-4 text-center transition-all hover:-translate-y-1 group relative"
                >
                  {hasAlert && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" title="Есть алерты" />
                  )}
                  <div className="text-base font-bold text-white group-hover:text-amber-400">{dept.name_short}</div>
                  <div className="text-xs text-gray-500 mt-1">{dept.staff_count} чел.</div>
                  <div className={`text-sm font-semibold mt-2 ${color}`}>
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
