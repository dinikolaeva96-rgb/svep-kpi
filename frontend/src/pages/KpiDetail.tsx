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
  if (actual == null) return 'text-svep-tertiary'
  const isInverse = ind.code.includes('incidents') || ind.code.includes('budget_variance')
  if (isInverse) {
    if (actual <= ind.warning_thr)  return 'text-green-600'
    if (actual <= ind.critical_thr) return 'text-amber-600'
    return 'text-red-600'
  }
  if (actual >= ind.warning_thr)  return 'text-green-600'
  if (actual >= ind.critical_thr) return 'text-amber-600'
  return 'text-red-600'
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
    <div className="pt-20 px-4 max-w-screen-xl mx-auto pb-12 bg-svep-bg min-h-screen">
      <div className="py-6">
        <div className="text-svep-tertiary text-sm mb-2 flex items-center gap-1">
          <Link to="/" className="hover:text-svep-accent">Экосистема</Link>
          <span>›</span>
          <Link to={`/dept/${deptId}`} className="hover:text-svep-accent">Отдел</Link>
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
                    style={{ backgroundColor: (indicator as any).domain_color + '20', color: (indicator as any).domain_color, border: `1px solid ${(indicator as any).domain_color}40` }}
                  >
                    {(indicator as any).domain_name}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-svep-primary">{indicator.name}</h1>
                {indicator.description && (
                  <p className="text-svep-secondary mt-2 max-w-2xl">{indicator.description}</p>
                )}
              </div>
              {canEdit && (
                <button
                  onClick={() => setShowAdd(true)}
                  className="text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shrink-0"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  + Ввести значение
                </button>
              )}
            </div>

            {/* Метрики */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {[
                { label: 'Последний факт', value: last?.actual != null ? `${last.actual} ${indicator.unit}` : '—', cls: last ? statusColor(last.actual, indicator) : 'text-svep-tertiary' },
                { label: 'Цель',           value: `${indicator.target} ${indicator.unit}`,       cls: 'text-svep-primary' },
                { label: 'Предупреждение', value: `${indicator.warning_thr} ${indicator.unit}`,  cls: 'text-amber-600' },
                { label: 'Критично',       value: `${indicator.critical_thr} ${indicator.unit}`, cls: 'text-red-600' },
              ].map(m => (
                <div key={m.label} className="bg-svep-surface border border-svep-border rounded-xl p-4">
                  <div className={`text-xl font-bold mono-num ${m.cls}`}>{m.value}</div>
                  <div className="eyebrow mt-1">{m.label}</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-svep-tertiary">Загрузка…</div>
        )}
      </div>

      {/* График */}
      {history.length > 0 && indicator && (
        <div className="bg-svep-surface border border-svep-border rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-svep-primary mb-6">Динамика</h2>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fill: '#9B9892', fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis tick={{ fill: '#9B9892', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}
                labelStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
              />
              <Legend wrapperStyle={{ color: '#6E6B65', fontSize: 12 }} />
              <ReferenceLine y={indicator.target}       stroke="#16A34A" strokeDasharray="6 3" strokeWidth={1.5} />
              <ReferenceLine y={indicator.warning_thr}  stroke="#CA8A04" strokeDasharray="4 3" strokeWidth={1} />
              <ReferenceLine y={indicator.critical_thr} stroke="#DC2626" strokeDasharray="4 3" strokeWidth={1} />
              <Line type="monotone" dataKey="факт" stroke="var(--accent)" strokeWidth={2.5} dot={{ r: 4, fill: 'var(--accent)' }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="план" stroke="#9B9892" strokeWidth={1.5} strokeDasharray="5 3" dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex gap-6 mt-3 text-xs text-svep-tertiary">
            <span className="flex items-center gap-1.5"><span className="inline-block w-4 h-px bg-green-600"></span> Цель: {indicator.target}</span>
            <span className="flex items-center gap-1.5"><span className="inline-block w-4 h-px bg-amber-600"></span> Порог: {indicator.warning_thr}</span>
            <span className="flex items-center gap-1.5"><span className="inline-block w-4 h-px bg-red-600"></span> Критично: {indicator.critical_thr}</span>
          </div>
        </div>
      )}

      {/* Таблица истории */}
      {history.length > 0 && indicator && (
        <div className="bg-svep-surface border border-svep-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-svep-primary">История значений</h2>
            <span className="eyebrow">{history.length} записей</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-svep-border text-left">
                  <th className="py-2 pr-4 text-svep-secondary font-medium">Период</th>
                  <th className="py-2 pr-4 text-svep-secondary font-medium">Факт</th>
                  <th className="py-2 pr-4 text-svep-secondary font-medium">План</th>
                  <th className="py-2 pr-4 text-svep-secondary font-medium">% план</th>
                  <th className="py-2 text-svep-secondary font-medium">Комментарий</th>
                  {canEdit && <th className="py-2"></th>}
                </tr>
              </thead>
              <tbody>
                {[...history].reverse().map(h => {
                  const pct = h.actual != null && h.plan != null && h.plan > 0
                    ? Math.round(h.actual / h.plan * 100) : null
                  return (
                    <tr key={h.id} className="border-b border-svep-border hover:bg-gray-50">
                      <td className="py-2 pr-4 text-svep-primary font-medium">
                        {MONTH_NAMES[h.period_month - 1]} {h.period_year}
                      </td>
                      <td className={`py-2 pr-4 font-semibold mono-num ${statusColor(h.actual, indicator)}`}>
                        {h.actual != null ? `${h.actual} ${indicator.unit}` : '—'}
                      </td>
                      <td className="py-2 pr-4 text-svep-secondary">
                        {h.plan != null ? `${h.plan} ${indicator.unit}` : '—'}
                      </td>
                      <td className={`py-2 pr-4 font-medium mono-num ${!pct ? 'text-svep-tertiary' : pct >= 100 ? 'text-green-600' : pct >= 80 ? 'text-amber-600' : 'text-red-600'}`}>
                        {pct != null ? `${pct}%` : '—'}
                      </td>
                      <td className="py-2 text-svep-tertiary text-xs max-w-[200px] truncate">
                        {h.comment ?? ''}
                      </td>
                      {canEdit && (
                        <td className="py-2 pl-2">
                          <button
                            onClick={() => setEditing(h)}
                            className="text-svep-tertiary hover:text-svep-accent text-xs px-2 py-1 rounded hover:bg-svep-accent-light transition-colors"
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
