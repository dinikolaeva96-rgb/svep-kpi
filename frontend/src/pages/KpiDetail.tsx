import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getKpiIndicator } from '@/api'
import type { Indicator, KpiValue } from '@/types'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Legend } from 'recharts'
import Modal        from '@/components/ui/Modal'
import KpiEntryForm from '@/components/forms/KpiEntryForm'
import { useAuthStore } from '@/store/auth'

const MONTH_NAMES = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек']

function statusColor(actual: number | null, ind: Indicator): string {
  if (actual == null) return 'text-gray-500'
  const isInverse = ind.code.includes('incidents') || ind.code.includes('budget_variance')
  if (isInverse) {
    if (actual <= ind.warning_thr)  return 'text-green-400'
    if (actual <= ind.critical_thr) return 'text-yellow-400'
    return 'text-red-400'
  }
  if (actual >= ind.warning_thr)  return 'text-green-400'
  if (actual >= ind.critical_thr) return 'text-yellow-400'
  return 'text-red-400'
}

export default function KpiDetail() {
  const { id: deptId, kpi: indicatorId } = useParams<{ id: string; kpi: string }>()
  const { user } = useAuthStore()
  const canEdit = user && ['admin', 'dept_head'].includes(user.role)

  const [indicator, setIndicator] = useState<Indicator | null>(null)
  const [history,   setHistory]   = useState<KpiValue[]>([])
  const [editing,   setEditing]   = useState<KpiValue | null>(null)
  const [showAdd,   setShowAdd]   = useState(false)

  const load = useCallback(() => {
    if (!deptId || !indicatorId) return
    getKpiIndicator(deptId, indicatorId).then((data: any) => {
      setIndicator(data.indicator)
      setHistory(data.history)
    })
  }, [deptId, indicatorId])

  useEffect(() => { load() }, [load])

  const chartData = history.map(h => ({
    name:  `${MONTH_NAMES[h.period_month - 1]} ${h.period_year}`,
    факт:  h.actual,
    план:  h.plan,
  }))

  const last = history[history.length - 1]

  return (
    <div className="pt-20 px-4 max-w-screen-xl mx-auto pb-12">
      <div className="py-6">
        <div className="text-gray-500 text-sm mb-2 flex items-center gap-1">
          <Link to="/" className="hover:text-gray-300">Экосистема</Link>
          <span>›</span>
          <Link to={`/dept/${deptId}`} className="hover:text-gray-300">Отдел</Link>
          <span>›</span>
          <span>Показатель</span>
        </div>

        {indicator ? (
          <>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: (indicator as any).domain_color + '30', color: (indicator as any).domain_color, border: `1px solid ${(indicator as any).domain_color}40` }}
                  >
                    {(indicator as any).domain_name}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-white">{indicator.name}</h1>
                {indicator.description && (
                  <p className="text-gray-400 mt-2 max-w-2xl">{indicator.description}</p>
                )}
              </div>
              {canEdit && (
                <button
                  onClick={() => setShowAdd(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shrink-0"
                >
                  + Ввести значение
                </button>
              )}
            </div>

            {/* Метрики */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {[
                { label: 'Последний факт', value: last?.actual != null ? `${last.actual} ${indicator.unit}` : '—', cls: last ? statusColor(last.actual, indicator) : 'text-gray-500' },
                { label: 'Цель',           value: `${indicator.target} ${indicator.unit}`,       cls: 'text-white' },
                { label: 'Предупреждение', value: `${indicator.warning_thr} ${indicator.unit}`,  cls: 'text-yellow-400' },
                { label: 'Критично',       value: `${indicator.critical_thr} ${indicator.unit}`, cls: 'text-red-400' },
              ].map(m => (
                <div key={m.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className={`text-xl font-bold ${m.cls}`}>{m.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{m.label}</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-gray-500">Загрузка…</div>
        )}
      </div>

      {/* График */}
      {history.length > 0 && indicator && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-6">Динамика</h2>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
              <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8 }}
                labelStyle={{ color: '#F9FAFB', fontWeight: 600 }}
              />
              <Legend wrapperStyle={{ color: '#9CA3AF', fontSize: 12 }} />
              <ReferenceLine y={indicator.target}       stroke="#22C55E" strokeDasharray="6 3" strokeWidth={1.5} />
              <ReferenceLine y={indicator.warning_thr}  stroke="#EAB308" strokeDasharray="4 3" strokeWidth={1} />
              <ReferenceLine y={indicator.critical_thr} stroke="#EF4444" strokeDasharray="4 3" strokeWidth={1} />
              <Line type="monotone" dataKey="факт" stroke="#60A5FA" strokeWidth={2.5} dot={{ r: 4, fill: '#60A5FA' }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="план" stroke="#4B5563"  strokeWidth={1.5} strokeDasharray="5 3" dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex gap-6 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><span className="inline-block w-4 h-px bg-green-500"></span> Цель: {indicator.target}</span>
            <span className="flex items-center gap-1.5"><span className="inline-block w-4 h-px bg-yellow-500"></span> Порог: {indicator.warning_thr}</span>
            <span className="flex items-center gap-1.5"><span className="inline-block w-4 h-px bg-red-500"></span> Критично: {indicator.critical_thr}</span>
          </div>
        </div>
      )}

      {/* Таблица истории */}
      {history.length > 0 && indicator && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">История значений</h2>
            <span className="text-xs text-gray-500">{history.length} записей</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left">
                  <th className="py-2 pr-4 text-gray-400 font-medium">Период</th>
                  <th className="py-2 pr-4 text-gray-400 font-medium">Факт</th>
                  <th className="py-2 pr-4 text-gray-400 font-medium">План</th>
                  <th className="py-2 pr-4 text-gray-400 font-medium">% план</th>
                  <th className="py-2 text-gray-400 font-medium">Комментарий</th>
                  {canEdit && <th className="py-2"></th>}
                </tr>
              </thead>
              <tbody>
                {[...history].reverse().map(h => {
                  const pct = h.actual != null && h.plan != null && h.plan > 0
                    ? Math.round(h.actual / h.plan * 100) : null
                  return (
                    <tr key={h.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="py-2 pr-4 text-white font-medium">
                        {MONTH_NAMES[h.period_month - 1]} {h.period_year}
                      </td>
                      <td className={`py-2 pr-4 font-semibold ${statusColor(h.actual, indicator)}`}>
                        {h.actual != null ? `${h.actual} ${indicator.unit}` : '—'}
                      </td>
                      <td className="py-2 pr-4 text-gray-400">
                        {h.plan != null ? `${h.plan} ${indicator.unit}` : '—'}
                      </td>
                      <td className={`py-2 pr-4 font-medium ${!pct ? 'text-gray-600' : pct >= 100 ? 'text-green-400' : pct >= 80 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {pct != null ? `${pct}%` : '—'}
                      </td>
                      <td className="py-2 text-gray-500 text-xs max-w-[200px] truncate">
                        {h.comment ?? ''}
                      </td>
                      {canEdit && (
                        <td className="py-2 pl-2">
                          <button
                            onClick={() => setEditing(h)}
                            className="text-gray-600 hover:text-white text-xs px-2 py-1 rounded hover:bg-gray-800 transition-colors"
                          >
                            ✏️
                          </button>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Модал ввода нового значения */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Ввести значение">
        {indicator && (
          <KpiEntryForm
            indicator={indicator}
            deptId={deptId!}
            year={new Date().getFullYear()}
            month={new Date().getMonth() + 1}
            onSaved={() => { setShowAdd(false); load() }}
            onCancel={() => setShowAdd(false)}
          />
        )}
      </Modal>

      {/* Модал редактирования существующего */}
      <Modal open={editing !== null} onClose={() => setEditing(null)} title="Редактировать значение">
        {indicator && editing && (
          <KpiEntryForm
            indicator={indicator}
            deptId={deptId!}
            year={editing.period_year}
            month={editing.period_month}
            initialActual={editing.actual}
            initialPlan={editing.plan}
            onSaved={() => { setEditing(null); load() }}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>
    </div>
  )
}
