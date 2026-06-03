import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAlerts } from '@/api'
import type { AlertsResponse, AlertItem } from '@/types'
import PeriodPicker from '@/components/ui/PeriodPicker'
import TrendBadge   from '@/components/ui/TrendBadge'
import Skeleton     from '@/components/ui/Skeleton'

function StatusDot({ status }: { status: 'red' | 'yellow' }) {
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${status === 'red' ? 'bg-red-500' : 'bg-yellow-500'}`} />
  )
}

function pctOf(actual: number | null, target: number): number | null {
  if (actual == null || target === 0) return null
  return Math.round(actual / target * 100)
}

export default function AlertsPage() {
  const [data,    setData]    = useState<AlertsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [year,    setYear]    = useState(new Date().getFullYear())
  const [month,   setMonth]   = useState(new Date().getMonth() + 1)
  const [filter,  setFilter]  = useState<'all' | 'red' | 'yellow'>('all')
  const [groupBy, setGroupBy] = useState<'dept' | 'domain'>('dept')

  useEffect(() => {
    setLoading(true)
    getAlerts(year, month).then(setData).finally(() => setLoading(false))
  }, [year, month])

  const alerts = (data?.alerts ?? []).filter(a => filter === 'all' || a.status === filter)

  // Группировка
  const grouped: Record<string, AlertItem[]> = {}
  for (const a of alerts) {
    const key = groupBy === 'dept' ? a.dept_name : a.domain_name
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(a)
  }

  return (
    <div className="pt-20 px-4 max-w-screen-xl mx-auto pb-12">
      <div className="flex flex-wrap items-start justify-between gap-4 py-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Алерты KPI</h1>
          <p className="text-gray-400 text-sm mt-1">Показатели, требующие немедленного внимания</p>
        </div>
        <PeriodPicker year={year} month={month} onYear={setYear} onMonth={setMonth} />
      </div>

      {/* Сводка */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Всего KPI',    value: data.summary.total,   cls: 'text-white' },
            { label: 'В норме',      value: data.summary.green,   cls: 'text-green-400' },
            { label: 'Предупрежд.',  value: data.summary.yellow,  cls: 'text-yellow-400' },
            { label: 'Критично',     value: data.summary.red,     cls: 'text-red-400' },
            { label: 'Нет данных',   value: data.summary.no_data, cls: 'text-gray-500' },
          ].map(s => (
            <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <div className={`text-2xl font-bold ${s.cls}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Прогресс-бар здоровья */}
      {data && data.summary.total > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
            <span>Здоровье системы</span>
            <span className="font-bold text-white">
              {Math.round(data.summary.green / data.summary.total * 100)}%
            </span>
          </div>
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden flex">
            <div className="bg-green-500 h-full transition-all"
              style={{ width: `${data.summary.green  / data.summary.total * 100}%` }} />
            <div className="bg-yellow-500 h-full transition-all"
              style={{ width: `${data.summary.yellow / data.summary.total * 100}%` }} />
            <div className="bg-red-500 h-full transition-all"
              style={{ width: `${data.summary.red    / data.summary.total * 100}%` }} />
          </div>
          <div className="flex gap-4 mt-1.5 text-xs text-gray-600">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block"/>Норма</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block"/>Предупреждение</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block"/>Критично</span>
          </div>
        </div>
      )}

      {/* Фильтры */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {([['all','Все'], ['red','Критично'], ['yellow','Предупреждения']] as const).map(([val, lbl]) => (
          <button key={val} onClick={() => setFilter(val)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === val ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
            }`}>
            {lbl} {data && val !== 'all' ? `(${data.summary[val]})` : ''}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 text-xs text-gray-400">
          Группировать:
          <button onClick={() => setGroupBy('dept')}
            className={`px-2 py-1 rounded ${groupBy === 'dept' ? 'bg-gray-700 text-white' : 'hover:text-white'}`}>
            По отделу
          </button>
          <button onClick={() => setGroupBy('domain')}
            className={`px-2 py-1 rounded ${groupBy === 'domain' ? 'bg-gray-700 text-white' : 'hover:text-white'}`}>
            По домену
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <Skeleton lines={3} />
            </div>
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">✅</div>
          <div className="text-xl font-semibold text-white mb-2">Всё в норме!</div>
          <div className="text-gray-400">Критичных и предупреждающих показателей не найдено</div>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).sort().map(([group, items]) => (
            <div key={group}>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider">{group}</h2>
                <div className="flex gap-1.5">
                  {items.filter(i => i.status === 'red').length > 0 && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                      🔴 {items.filter(i => i.status === 'red').length}
                    </span>
                  )}
                  {items.filter(i => i.status === 'yellow').length > 0 && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                      🟡 {items.filter(i => i.status === 'yellow').length}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
                {items.map(alert => {
                  const pct = pctOf(alert.actual, alert.target)
                  return (
                    <Link
                      key={alert.indicator_id}
                      to={`/dept/${alert.dept_id}/kpi/${alert.indicator_id}`}
                      className="group bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl p-4 transition-all hover:-translate-y-0.5"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <StatusDot status={alert.status} />
                          <span className="text-xs"
                            style={{ color: alert.domain_color }}>
                            {alert.domain_icon} {groupBy === 'dept' ? alert.domain_name : alert.dept_name}
                          </span>
                        </div>
                        <TrendBadge trend={alert.trend} />
                      </div>

                      <div className="text-white font-medium group-hover:text-amber-400 transition-colors text-sm leading-snug mb-2">
                        {alert.name}
                      </div>

                      <div className="flex items-end gap-3">
                        <div>
                          <span className={`text-lg font-bold ${alert.status === 'red' ? 'text-red-400' : 'text-yellow-400'}`}>
                            {alert.actual ?? '—'} {alert.unit}
                          </span>
                          <span className="text-gray-600 text-xs ml-1">факт</span>
                        </div>
                        <div className="text-gray-600 pb-0.5">·</div>
                        <div>
                          <span className="text-gray-400 text-sm">{alert.target} {alert.unit}</span>
                          <span className="text-gray-600 text-xs ml-1">цель</span>
                        </div>
                        {pct !== null && (
                          <div className="ml-auto text-right">
                            <span className={`text-sm font-bold ${pct >= 80 ? 'text-yellow-400' : 'text-red-400'}`}>
                              {pct}%
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Прогресс */}
                      {pct !== null && (
                        <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${alert.status === 'red' ? 'bg-red-500' : 'bg-yellow-500'}`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                      )}

                      {alert.prev_actual != null && (
                        <div className="mt-2 text-xs text-gray-600">
                          Пред. период: {alert.prev_actual} {alert.unit}
                        </div>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
