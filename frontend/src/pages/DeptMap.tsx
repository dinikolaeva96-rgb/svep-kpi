import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getKpi, getDepartment } from '@/api'
import type { KpiResponse, Department } from '@/types'
import StatusBadge from '@/components/ui/StatusBadge'

const DOMAINS_ORDER = ['quality', 'delivery', 'cost', 'safety', 'morale', 'innovation']

export default function DeptMap() {
  const { id } = useParams<{ id: string }>()
  const [dept, setDept] = useState<Department | null>(null)
  const [kpi,  setKpi]  = useState<KpiResponse | null>(null)
  const [year, setYear]   = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)

  useEffect(() => {
    if (!id) return
    getDepartment(id).then(d => setDept(d as Department))
    getKpi(id, year, month).then(setKpi)
  }, [id, year, month])

  const grouped = kpi
    ? DOMAINS_ORDER.reduce<Record<string, typeof kpi.indicators>>((acc, dc) => {
        acc[dc] = kpi.indicators.filter(i => i.domain_code === dc)
        return acc
      }, {})
    : {}

  const MONTH_NAMES = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек']

  return (
    <div className="pt-20 px-4 max-w-screen-xl mx-auto pb-12">
      <div className="flex flex-wrap items-start justify-between gap-4 py-6">
        <div>
          <div className="text-gray-500 text-sm mb-1">
            <Link to="/" className="hover:text-gray-300">Экосистема</Link> / Отдел
          </div>
          <h1 className="text-2xl font-bold text-white">
            {dept?.name_short ?? '…'} <span className="text-gray-500 font-normal text-lg">— {dept?.name_full}</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">{dept?.staff_count} сотрудников</p>
        </div>
        <div className="flex gap-2">
          <select value={year} onChange={e => setYear(+e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-white">
            {[2025, 2026].map(y => <option key={y}>{y}</option>)}
          </select>
          <select value={month} onChange={e => setMonth(+e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-white">
            {MONTH_NAMES.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
          </select>
        </div>
      </div>

      {!kpi ? (
        <div className="text-gray-500 text-center py-20">Загрузка…</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kpi.indicators.map(ind => (
            <Link
              key={ind.id}
              to={`/dept/${id}/kpi/${ind.id}`}
              className="bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl p-5 transition-all hover:-translate-y-0.5 group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full text-white/80"
                  style={{ backgroundColor: ind.domain_color + '40', border: `1px solid ${ind.domain_color}50` }}>
                  {ind.domain_name}
                </span>
                <StatusBadge status={(ind.status ?? 'no_data') as any} />
              </div>
              <div className="text-white font-semibold group-hover:text-amber-400 transition-colors">{ind.name}</div>
              <div className="flex items-end gap-3 mt-3">
                <div>
                  <div className="text-2xl font-bold text-white">
                    {ind.actual !== null && ind.actual !== undefined ? `${ind.actual} ${ind.unit}` : '—'}
                  </div>
                  <div className="text-xs text-gray-500">факт</div>
                </div>
                <div className="text-gray-600">/</div>
                <div>
                  <div className="text-lg text-gray-400">{ind.target} {ind.unit}</div>
                  <div className="text-xs text-gray-500">цель</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
