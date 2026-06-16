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
    <div className="pt-14 bg-svep-bg min-h-screen">
      <div className="max-w-screen-xl mx-auto px-6">
        <div className="flex flex-wrap items-center justify-between gap-4 py-8">
          <div>
            <p className="eyebrow mb-2">KPI-портал</p>
            <h1 className="font-brutal font-extrabold text-3xl tracking-[-0.01em] text-svep-primary">
              Мастер-карта
            </h1>
            <p className="text-svep-secondary text-sm mt-1">16 отделов × 6 lean-доменов</p>
          </div>
          <div className="flex gap-2">
            <select
              value={year}
              onChange={e => setYear(+e.target.value)}
              className="input-light"
            >
              {[2025, 2026].map(y => <option key={y}>{y}</option>)}
            </select>
            <select
              value={month}
              onChange={e => setMonth(+e.target.value)}
              className="input-light"
            >
              {MONTH_NAMES.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
            </select>
          </div>
        </div>

        {!data ? (
          <div className="text-svep-tertiary text-center py-20">Загрузка…</div>
        ) : (
          <div className="overflow-x-auto pb-12">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-svep-border">
                  <th className="text-left eyebrow p-3 w-28" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 500 }}>
                    Отдел
                  </th>
                  {data.domains.map(dom => (
                    <th key={dom.code} className="text-center p-2 min-w-[80px]">
                      <div className="text-base">{dom.icon}</div>
                      <div className="eyebrow mt-0.5" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 10 }}>
                        {dom.name_ru}
                      </div>
                    </th>
                  ))}
                  <th className="text-center p-2 min-w-[80px] text-svep-secondary font-medium text-xs">Итог</th>
                </tr>
              </thead>
              <tbody>
                {data.departments.map(dept => (
                  <tr key={dept.id} className="border-b border-svep-border hover:bg-gray-50 transition-colors">
                    <td className="p-2.5">
                      <button
                        onClick={() => navigate(`/dept/${dept.id}`)}
                        className="text-left text-svep-primary font-medium hover:text-svep-accent transition-colors text-sm"
                      >
                        {dept.name_short}
                      </button>
                      <div className="eyebrow mt-0.5" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 10 }}>
                        {dept.staff_count} чел.
                      </div>
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
    </div>
  )
}
