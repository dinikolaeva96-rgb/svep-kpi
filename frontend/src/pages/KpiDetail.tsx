import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getKpiIndicator } from '@/api'
import type { Indicator, KpiValue } from '@/types'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Legend } from 'recharts'

const MONTH_NAMES = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек']

export default function KpiDetail() {
  const { id: deptId, kpi: indicatorId } = useParams<{ id: string; kpi: string }>()
  const [indicator, setIndicator] = useState<Indicator | null>(null)
  const [history, setHistory]     = useState<KpiValue[]>([])

  useEffect(() => {
    if (!deptId || !indicatorId) return
    getKpiIndicator(deptId, indicatorId).then((data: any) => {
      setIndicator(data.indicator)
      setHistory(data.history)
    })
  }, [deptId, indicatorId])

  const chartData = history.map(h => ({
    name: `${MONTH_NAMES[h.period_month - 1]} ${h.period_year}`,
    факт: h.actual,
    план: h.plan,
  }))

  const lastVal = history[history.length - 1]

  return (
    <div className="pt-20 px-4 max-w-screen-xl mx-auto pb-12">
      <div className="py-6">
        <div className="text-gray-500 text-sm mb-2">
          <Link to="/" className="hover:text-gray-300">Экосистема</Link>
          {' / '}
          <Link to={`/dept/${deptId}`} className="hover:text-gray-300">Отдел</Link>
          {' / Показатель'}
        </div>
        {indicator ? (
          <>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-base px-2 py-0.5 rounded-full text-xs font-medium text-white/80"
                style={{ backgroundColor: (indicator as any).domain_color + '40', border: `1px solid ${(indicator as any).domain_color}50` }}>
                {(indicator as any).domain_name}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white">{indicator.name}</h1>
            {indicator.description && <p className="text-gray-400 mt-2">{indicator.description}</p>}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {[
                { label: 'Факт (посл.)',  value: lastVal?.actual !== null && lastVal?.actual !== undefined ? `${lastVal.actual} ${indicator.unit}` : '—' },
                { label: 'Цель',          value: `${indicator.target} ${indicator.unit}` },
                { label: 'Предупреждение',value: `${indicator.warning_thr} ${indicator.unit}` },
                { label: 'Критично',      value: `${indicator.critical_thr} ${indicator.unit}` },
              ].map(m => (
                <div key={m.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="text-lg font-bold text-white">{m.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{m.label}</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-gray-500">Загрузка…</div>
        )}
      </div>

      {history.length > 0 && indicator && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6">История</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
              <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8 }}
                labelStyle={{ color: '#F9FAFB' }}
              />
              <Legend />
              <ReferenceLine y={indicator.target}       stroke="#22C55E" strokeDasharray="6 3" label={{ value: 'Цель', fill: '#22C55E', fontSize: 11 }} />
              <ReferenceLine y={indicator.warning_thr}  stroke="#EAB308" strokeDasharray="4 3" />
              <ReferenceLine y={indicator.critical_thr} stroke="#EF4444" strokeDasharray="4 3" />
              <Line type="monotone" dataKey="факт" stroke="#60A5FA" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="план" stroke="#6B7280" strokeWidth={1.5} strokeDasharray="5 3" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
