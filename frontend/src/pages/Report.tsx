import { useEffect, useState, useRef } from 'react'
import { getMaster, getAlerts, getCompanyTrends } from '@/api'
import type { MasterResponse, AlertsResponse, TrendPoint } from '@/types'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, Legend, ReferenceLine,
} from 'recharts'

function exportCSV(master: MasterResponse) {
  const header = ['Отдел', 'Сотрудников', ...master.domains.map(d => d.name_ru), 'Итого'].join(';')
  const rows = master.departments.map(dept => [
    dept.name_short,
    dept.staff_count,
    ...master.domains.map(d => dept.domains[d.code]?.score ?? ''),
    dept.overall_score ?? '',
  ].join(';'))
  const csv = '﻿' + [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url
  a.download = `svep-kpi-${new Date().toISOString().slice(0,7)}.csv`
  a.click(); URL.revokeObjectURL(url)
}

function scoreColor(s: number | null) {
  if (s === null) return 'text-gray-600'
  return s >= 80 ? 'text-green-400' : s >= 60 ? 'text-yellow-400' : 'text-red-400'
}

const MONTH_NAMES = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек']

export default function Report() {
  const [master,  setMaster]  = useState<MasterResponse | null>(null)
  const [alerts,  setAlerts]  = useState<AlertsResponse | null>(null)
  const [trends,  setTrends]  = useState<TrendPoint[]>([])
  const [loading, setLoading] = useState(true)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    Promise.all([
      getMaster().then(setMaster),
      getAlerts().then(setAlerts).catch(() => {}),
      getCompanyTrends(12).then(d => setTrends(d.points)).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [])

  const handlePrint = () => window.print()

  const barData = master?.departments.map(d => ({
    name:  d.name_short,
    score: d.overall_score ?? 0,
  })) ?? []

  const top3    = [...barData].sort((a, b) => b.score - a.score).slice(0, 3)
  const bottom3 = [...barData].sort((a, b) => a.score - b.score).slice(0, 3)

  const domainSummary = master?.domains.map(dom => {
    const vals = master.departments
      .map(d => d.domains[dom.code]?.score)
      .filter((v): v is number => v !== null && v !== undefined)
    const avg = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null
    const minV = vals.length ? Math.round(Math.min(...vals)) : null
    const maxV = vals.length ? Math.round(Math.max(...vals)) : null
    return { ...dom, avg, min: minV, max: maxV }
  }) ?? []

  return (
    <div className="pt-20 px-4 max-w-screen-xl mx-auto pb-12" ref={printRef}>
      {/* Шапка */}
      <div className="flex flex-wrap items-start justify-between gap-4 py-6 print:py-2">
        <div>
          <div className="text-xs text-gray-500 mb-1">ООО «Средневолжскэлектропроект» · Казань</div>
          <h1 className="text-2xl font-bold text-white print:text-black">Отчёт KPI</h1>
          <p className="text-gray-400 text-sm mt-1">
            Период: {master ? `${MONTH_NAMES[master.month - 1]} ${master.year}` : '…'}
            &nbsp;·&nbsp;Сформирован: {new Date().toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2 print:hidden">
          {master && (
            <button
              onClick={() => exportCSV(master)}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white text-sm px-4 py-2 rounded-lg transition-colors border border-gray-700"
            >
              📥 Экспорт CSV
            </button>
          )}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg transition-colors"
          >
            🖨 Печать
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-500 text-center py-20">Загрузка…</div>
      ) : !master ? null : (
        <div className="space-y-8">

          {/* Итоговые метрики */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Отделов',    value: master.departments.length, cls: 'text-white' },
              { label: 'Зелёная зона', value: master.departments.filter(d => (d.overall_score ?? 0) >= 80).length, cls: 'text-green-400' },
              { label: 'Алертов',    value: alerts ? alerts.summary.red + alerts.summary.yellow : '…', cls: 'text-yellow-400' },
              { label: 'Критичных',  value: alerts?.summary.red ?? '…', cls: 'text-red-400' },
            ].map(m => (
              <div key={m.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center">
                <div className={`text-3xl font-bold ${m.cls}`}>{m.value}</div>
                <div className="text-xs text-gray-500 mt-1">{m.label}</div>
              </div>
            ))}
          </div>

          {/* Сводка по доменам */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Сводка по lean-доменам</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {domainSummary.map(d => (
                <div key={d.code} className="text-center p-3 rounded-xl border border-gray-800 bg-gray-800/30">
                  <div className="text-2xl mb-1">{d.icon}</div>
                  <div className="text-xs text-gray-400">{d.name_ru}</div>
                  <div className={`text-xl font-bold mt-1 ${scoreColor(d.avg)}`}>{d.avg ?? '—'}%</div>
                  {d.min !== null && d.max !== null && (
                    <div className="text-[10px] text-gray-600 mt-0.5">
                      {d.min}% – {d.max}%
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bar chart */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-6">KPI по отделам</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData} margin={{ top: 5, right: 10, bottom: 44, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 10 }} angle={-45} textAnchor="end" interval={0} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8 }}
                  formatter={(v: any) => [`${v}%`, 'KPI']}
                />
                <ReferenceLine y={80} stroke="#22C55E" strokeDasharray="4 2" />
                <ReferenceLine y={60} stroke="#EAB308" strokeDasharray="4 2" />
                <Bar dataKey="score" radius={[4, 4, 0, 0]} maxBarSize={36}>
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={entry.score >= 80 ? '#22C55E' : entry.score >= 60 ? '#EAB308' : '#EF4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Тренд предприятия */}
          {trends.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-6">Динамика KPI предприятия</h2>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trends.map(t => ({ name: t.label, score: t.score }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                  <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8 }}
                    formatter={(v: any) => [`${v}%`, 'KPI']}
                  />
                  <ReferenceLine y={80} stroke="#22C55E" strokeDasharray="4 2" strokeWidth={1} />
                  <Line type="monotone" dataKey="score" stroke="#60A5FA" strokeWidth={2.5}
                    dot={{ r: 4, fill: '#60A5FA', strokeWidth: 0 }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Топ / Аутсайдеры */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-green-400 mb-4">🏆 Лидеры месяца</h2>
              <div className="space-y-3">
                {top3.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-3">
                    <span className="text-xl w-7 text-center">{['🥇','🥈','🥉'][i]}</span>
                    <div className="flex-1 text-white">{d.name}</div>
                    <span className="font-bold text-green-400 tabular-nums">{d.score}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-red-400 mb-4">⚠️ Требуют внимания</h2>
              <div className="space-y-3">
                {bottom3.map((d) => (
                  <div key={d.name} className="flex items-center gap-3">
                    <span className="text-xl w-7 text-center">🔻</span>
                    <div className="flex-1 text-white">{d.name}</div>
                    <span className={`font-bold tabular-nums ${d.score < 60 ? 'text-red-400' : 'text-yellow-400'}`}>{d.score}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Алерты */}
          {alerts && alerts.alerts.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                🚨 Критичные показатели ({alerts.alerts.length})
              </h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-left">
                    {['Отдел','Домен','Показатель','Факт','Цель','%','Статус'].map(h => (
                      <th key={h} className="py-2 pr-3 text-gray-400 font-medium text-xs">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {alerts.alerts.map(a => {
                    const pct = a.actual != null && a.target > 0 ? Math.round(a.actual / a.target * 100) : null
                    return (
                      <tr key={a.indicator_id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="py-2 pr-3 text-white font-medium">{a.dept_name}</td>
                        <td className="py-2 pr-3 text-xs text-gray-400">{a.domain_icon} {a.domain_name}</td>
                        <td className="py-2 pr-3 text-gray-200">{a.name}</td>
                        <td className={`py-2 pr-3 font-bold ${a.status === 'red' ? 'text-red-400' : 'text-yellow-400'}`}>
                          {a.actual ?? '—'} {a.unit}
                        </td>
                        <td className="py-2 pr-3 text-gray-500">{a.target} {a.unit}</td>
                        <td className={`py-2 pr-3 font-medium ${!pct ? 'text-gray-600' : pct >= 80 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {pct ?? '—'}%
                        </td>
                        <td className="py-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                            a.status === 'red'
                              ? 'bg-red-500/20 text-red-300 border-red-500/30'
                              : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                          }`}>
                            {a.status === 'red' ? '🔴 Критично' : '🟡 Предупр.'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Сводная таблица */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Сводная таблица</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-2 pr-3 text-gray-400">Отдел</th>
                    {master.domains.map(d => (
                      <th key={d.code} className="text-center py-2 px-1 text-gray-400 text-xs whitespace-nowrap">
                        {d.icon} {d.name_ru}
                      </th>
                    ))}
                    <th className="text-center py-2 px-1 text-gray-300 font-semibold">Итог</th>
                  </tr>
                </thead>
                <tbody>
                  {master.departments.map(dept => (
                    <tr key={dept.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="py-2 pr-3 text-white font-medium">{dept.name_short}</td>
                      {master.domains.map(dom => {
                        const s = dept.domains[dom.code]?.score
                        return (
                          <td key={dom.code} className={`text-center py-2 px-1 text-xs font-medium ${scoreColor(s ?? null)}`}>
                            {s != null ? `${s}%` : '—'}
                          </td>
                        )
                      })}
                      <td className={`text-center py-2 px-1 font-bold ${scoreColor(dept.overall_score)}`}>
                        {dept.overall_score != null ? `${dept.overall_score}%` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
