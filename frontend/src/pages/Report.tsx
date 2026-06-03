import { useEffect, useState } from 'react'
import { getMaster } from '@/api'
import type { MasterResponse } from '@/types'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function Report() {
  const [data, setData] = useState<MasterResponse | null>(null)

  useEffect(() => { getMaster().then(setData) }, [])

  const barData = data?.departments.map(d => ({
    name: d.name_short,
    score: d.overall_score ?? 0,
  })) ?? []

  const top3    = [...barData].sort((a, b) => b.score - a.score).slice(0, 3)
  const bottom3 = [...barData].sort((a, b) => a.score - b.score).slice(0, 3)

  return (
    <div className="pt-20 px-4 max-w-screen-xl mx-auto pb-12">
      <div className="py-6">
        <h1 className="text-2xl font-bold text-white">Отчёт для руководства</h1>
        <p className="text-gray-400 text-sm mt-1">
          Период: {data ? `${data.month}/${data.year}` : '…'} · Сформирован: {new Date().toLocaleDateString('ru')}
        </p>
      </div>

      {!data ? (
        <div className="text-gray-500 text-center py-20">Загрузка…</div>
      ) : (
        <div className="space-y-8">
          {/* Bar chart */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-6">KPI по отделам</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} margin={{ top: 5, right: 10, bottom: 40, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 10 }} angle={-45} textAnchor="end" />
                <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8 }}
                  labelStyle={{ color: '#F9FAFB' }}
                />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.score >= 80 ? '#22C55E' : entry.score >= 60 ? '#EAB308' : '#EF4444'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Лидеры */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-green-400 mb-4">🏆 Топ-3 отдела</h2>
              <div className="space-y-3">
                {top3.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-3">
                    <span className="text-lg">{['🥇','🥈','🥉'][i]}</span>
                    <div className="flex-1">{d.name}</div>
                    <span className="font-bold text-green-400">{d.score}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Требуют внимания */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-red-400 mb-4">⚠️ Требуют внимания</h2>
              <div className="space-y-3">
                {bottom3.map((d) => (
                  <div key={d.name} className="flex items-center gap-3">
                    <span className="text-lg">🔻</span>
                    <div className="flex-1">{d.name}</div>
                    <span className={`font-bold ${d.score < 60 ? 'text-red-400' : 'text-yellow-400'}`}>{d.score}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Таблица */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Сводная таблица</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-2 text-gray-400">Отдел</th>
                  {data.domains.map(d => (
                    <th key={d.code} className="text-center py-2 text-gray-400 text-xs">{d.name_ru}</th>
                  ))}
                  <th className="text-center py-2 text-gray-300 font-semibold">Итог</th>
                </tr>
              </thead>
              <tbody>
                {data.departments.map(dept => (
                  <tr key={dept.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="py-2 text-white font-medium">{dept.name_short}</td>
                    {data.domains.map(dom => {
                      const s = dept.domains[dom.code]?.score
                      return (
                        <td key={dom.code} className={`text-center py-2 text-xs ${
                          s === null ? 'text-gray-600' : s >= 80 ? 'text-green-400' : s >= 60 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {s !== null && s !== undefined ? `${s}%` : '—'}
                        </td>
                      )
                    })}
                    <td className={`text-center py-2 font-bold ${
                      dept.overall_score === null ? 'text-gray-600' :
                      dept.overall_score >= 80 ? 'text-green-400' : dept.overall_score >= 60 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {dept.overall_score !== null ? `${dept.overall_score}%` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
