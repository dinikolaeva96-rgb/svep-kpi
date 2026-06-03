import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getKpi, getDepartment } from '@/api'
import type { KpiResponse, Department, Indicator } from '@/types'
import StatusBadge   from '@/components/ui/StatusBadge'
import PeriodPicker  from '@/components/ui/PeriodPicker'
import Modal         from '@/components/ui/Modal'
import Skeleton      from '@/components/ui/Skeleton'
import KpiEntryForm  from '@/components/forms/KpiEntryForm'
import { useAuthStore } from '@/store/auth'

const DOMAIN_ICONS: Record<string, string> = {
  quality: '🏆', delivery: '⏱️', cost: '💰',
  safety: '🛡️', morale: '❤️', innovation: '💡',
}

export default function DeptMap() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const canEdit = user && ['admin', 'dept_head'].includes(user.role)

  const [dept,  setDept]  = useState<Department | null>(null)
  const [kpi,   setKpi]   = useState<KpiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [year,  setYear]  = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [editing, setEditing] = useState<Indicator | null>(null)
  const [filter,  setFilter]  = useState<string>('all')

  const load = useCallback(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      getDepartment(id).then(d => setDept(d as Department)),
      getKpi(id, year, month).then(setKpi),
    ]).finally(() => setLoading(false))
  }, [id, year, month])

  useEffect(() => { load() }, [load])

  const indicators = kpi?.indicators ?? []
  const domains    = [...new Set(indicators.map(i => i.domain_code))]

  const filtered = filter === 'all'
    ? indicators
    : filter === 'issues'
    ? indicators.filter(i => i.status === 'red' || i.status === 'yellow')
    : indicators.filter(i => i.domain_code === filter)

  // Aggregate per domain
  const domainScores = domains.map(dc => {
    const inds = indicators.filter(i => i.domain_code === dc)
    const statuses = inds.map(i => i.status ?? 'no_data')
    const green  = statuses.filter(s => s === 'green').length
    const total  = inds.length
    const pct    = total ? Math.round(green / total * 100) : null
    return { code: dc, name: inds[0]?.domain_name, color: inds[0]?.domain_color, pct, total, green }
  })

  return (
    <div className="pt-20 px-4 max-w-screen-xl mx-auto pb-12">
      {/* Заголовок */}
      <div className="flex flex-wrap items-start justify-between gap-4 py-6">
        <div>
          <div className="text-gray-500 text-sm mb-1">
            <Link to="/" className="hover:text-gray-300">Экосистема</Link>
            <span className="mx-1">›</span>
            <Link to="/master" className="hover:text-gray-300">Мастер-карта</Link>
            <span className="mx-1">›</span> Отдел
          </div>
          {dept ? (
            <>
              <h1 className="text-2xl font-bold text-white">
                {dept.name_short}
                <span className="text-gray-500 font-normal text-lg ml-2">— {dept.name_full}</span>
              </h1>
              <p className="text-gray-400 text-sm mt-1">{dept.staff_count} сотрудников</p>
            </>
          ) : (
            <Skeleton lines={2} className="w-64" />
          )}
        </div>
        <PeriodPicker year={year} month={month} onYear={setYear} onMonth={setMonth} />
      </div>

      {/* 6 lean-доменов: мини-шкала */}
      {!loading && domainScores.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
          {domainScores.map(d => (
            <button
              key={d.code}
              onClick={() => setFilter(filter === d.code ? 'all' : d.code)}
              className={`rounded-xl p-3 text-center border transition-all ${
                filter === d.code
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-800 bg-gray-900 hover:border-gray-600'
              }`}
            >
              <div className="text-xl mb-1">{DOMAIN_ICONS[d.code] ?? '📊'}</div>
              <div className="text-xs text-gray-400 truncate">{d.name}</div>
              <div className={`text-sm font-bold mt-1 ${
                d.pct === null ? 'text-gray-600'
                : d.pct >= 80 ? 'text-green-400'
                : d.pct >= 60 ? 'text-yellow-400'
                : 'text-red-400'
              }`}>
                {d.pct !== null ? `${d.pct}%` : '—'}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Фильтр-таб */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {[
          { key: 'all',    label: `Все (${indicators.length})` },
          { key: 'issues', label: `Проблемы (${indicators.filter(i => ['red','yellow'].includes(i.status ?? '')).length})` },
        ].map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === t.key ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Карточки KPI */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <Skeleton lines={3} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(ind => {
            const pct = ind.actual != null && ind.target > 0
              ? Math.round(ind.actual / ind.target * 100)
              : null
            return (
              <div key={ind.id} className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-5 group relative">
                {/* Домен-бейдж */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: ind.domain_color + '30', color: ind.domain_color, border: `1px solid ${ind.domain_color}40` }}
                  >
                    {DOMAIN_ICONS[ind.domain_code]} {ind.domain_name}
                  </span>
                  <StatusBadge status={(ind.status ?? 'no_data') as any} />
                </div>

                {/* Название */}
                <Link to={`/dept/${id}/kpi/${ind.id}`} className="block">
                  <div className="text-white font-semibold group-hover:text-amber-400 transition-colors mb-3">
                    {ind.name}
                  </div>
                </Link>

                {/* Значения */}
                <div className="flex items-end gap-4">
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {ind.actual != null ? `${ind.actual}` : '—'}
                    </div>
                    <div className="text-xs text-gray-500">факт / {ind.unit}</div>
                  </div>
                  <div className="text-gray-700 text-lg pb-1">·</div>
                  <div>
                    <div className="text-lg text-gray-400">{ind.target}</div>
                    <div className="text-xs text-gray-500">цель</div>
                  </div>
                  {pct !== null && (
                    <div className="ml-auto">
                      <div className={`text-lg font-bold ${pct >= 100 ? 'text-green-400' : pct >= 80 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {pct}%
                      </div>
                      <div className="text-xs text-gray-500">выполн.</div>
                    </div>
                  )}
                </div>

                {/* Прогресс-бар */}
                {pct !== null && (
                  <div className="mt-3 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-green-500' : pct >= 80 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                )}

                {/* Кнопка редактирования */}
                {canEdit && (
                  <button
                    onClick={() => setEditing(ind)}
                    className="absolute top-3 right-3 text-gray-600 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-all"
                  >
                    ✏️
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Ссылка на кайдзен отдела */}
      {dept && (
        <div className="mt-8 text-center">
          <Link
            to={`/kaizen?dept=${id}`}
            className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 bg-blue-900/20 border border-blue-800/40 rounded-lg px-4 py-2 transition-colors"
          >
            💡 Кайдзен-предложения отдела {dept.name_short} →
          </Link>
        </div>
      )}

      {/* Модал редактирования */}
      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title="Ввод значения KPI"
      >
        {editing && (
          <KpiEntryForm
            indicator={editing}
            deptId={id!}
            year={year}
            month={month}
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
