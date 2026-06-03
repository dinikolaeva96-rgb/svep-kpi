import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMaster } from '@/api'
import type { MasterResponse } from '@/types'
import ScoreCell from '@/components/ui/ScoreCell'

export default function MasterMap() {
  const [data, setData] = useState<MasterResponse | null>(null)
  const [year, setYear]   = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const navigate = useNavigate()

  useEffect(() => {
    getMaster(year, month).then(setData)
  }, [year, month])

  const MONTH_NAMES = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек']

  return (
    <div className="pt-20 px-4 max-w-screen-xl mx-auto pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4 py-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Мастер-карта KPI</h1>
          <p className="text-gray-400 text-sm mt-1">Тепловая карта 16 отделов × 6 lean-доменов</p>
        </div>
        <div className="flex gap-2">
          <select
            value={year}
            onChange={e => setYear(+e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-white"
          >
            {[2025, 2026].map(y => <option key={y}>{y}</option>)}
          </select>
          <select
            value={month}
            onChange={e => setMonth(+e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-white"
          >
            {MONTH_NAMES.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
          </select>
        </div>
      </div>

      {!data ? (
        <div className="text-gray-500 text-center py-20">Загрузка…</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="text-left text-gray-400 font-medium p-2 w-28">Отдел</th>
                {data.domains.map(dom => (
                  <th key={dom.code} className="text-center p-2 min-w-[80px]">
                    <div className="text-base">{dom.icon}</div>
                    <div className="text-[10px] text-gray-400">{dom.name_ru}</div>
                  </th>
                ))}
                <th className="text-center p-2 min-w-[80px] text-gray-300">Итог</th>
              </tr>
            </thead>
            <tbody>
              {data.departments.map(dept => (
                <tr key={dept.id} className="border-t border-gray-800 hover:bg-gray-900/50">
                  <td className="p-2">
                    <button
                      onClick={() => navigate(`/dept/${dept.id}`)}
                      className="text-left text-white font-medium hover:text-amber-400 transition-colors"
                    >
                      {dept.name_short}
                    </button>
                    <div className="text-[10px] text-gray-500">{dept.staff_count} чел.</div>
                  </td>
                  {data.domains.map(dom => (
                    <td key={dom.code} className="p-1">
                      <ScoreCell
                        score={dept.domains[dom.code]?.score ?? null}
                        className="h-12 w-full"
                        onClick={() => navigate(`/dept/${dept.id}`)}
                      />
                    </td>
                  ))}
                  <td className="p-1">
                    <ScoreCell
                      score={dept.overall_score}
                      className="h-12 w-full font-bold"
                      onClick={() => navigate(`/dept/${dept.id}`)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
