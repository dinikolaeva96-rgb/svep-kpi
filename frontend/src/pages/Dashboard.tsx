import { useEffect, useState } from 'react'
import { getMaster } from '@/api'
import type { MasterResponse } from '@/types'
import ScoreCell from '@/components/ui/ScoreCell'

export default function Dashboard() {
  const [data, setData] = useState<MasterResponse | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const load = () => getMaster().then(setData)
    load()
    const iv = setInterval(() => { load(); setTick(t => t + 1) }, 60_000)
    return () => clearInterval(iv)
  }, [])

  const now = new Date()
  const avgScore = data
    ? Math.round(data.departments.map(d => d.overall_score ?? 0).reduce((a, b) => a + b, 0) / (data.departments.length || 1))
    : null

  return (
    <div className="min-h-screen bg-gray-950 pt-16 px-4 pb-4 flex flex-col">
      <header className="flex items-center justify-between py-4 border-b border-gray-800 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚡</span>
          <div>
            <div className="text-lg font-bold text-white">Экосистема СВЭП</div>
            <div className="text-xs text-gray-500">ООО «Средневолжскэлектропроект»</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-mono text-amber-400">
            {now.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-xs text-gray-500">{now.toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
        </div>
      </header>

      {/* KPI-сводка */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center col-span-1">
          <div className="text-4xl font-bold text-white">{avgScore !== null ? `${avgScore}%` : '…'}</div>
          <div className="text-sm text-gray-400 mt-1">Средний KPI по предприятию</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center">
          <div className="text-4xl font-bold text-green-400">
            {data ? data.departments.filter(d => (d.overall_score ?? 0) >= 80).length : '…'}
          </div>
          <div className="text-sm text-gray-400 mt-1">Отделов в зелёной зоне</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center">
          <div className="text-4xl font-bold text-red-400">
            {data ? data.departments.filter(d => (d.overall_score ?? 100) < 60).length : '…'}
          </div>
          <div className="text-sm text-gray-400 mt-1">Требуют внимания</div>
        </div>
      </div>

      {/* Тепловая карта */}
      {data && (
        <div className="flex-1 overflow-auto">
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(data.departments.length, 8)}, 1fr)` }}>
            {data.departments.map(dept => (
              <div key={dept.id} className="flex flex-col gap-1">
                <div className="text-center text-xs font-bold text-gray-300 truncate">{dept.name_short}</div>
                {data.domains.map(dom => (
                  <ScoreCell
                    key={dom.code}
                    score={dept.domains[dom.code]?.score ?? null}
                    label={dom.name_ru}
                    className="h-10"
                  />
                ))}
                <ScoreCell
                  score={dept.overall_score}
                  label="ИТОГ"
                  className="h-12 border-t border-gray-700 mt-1"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-center text-xs text-gray-700 mt-4">
        Обновлено: {now.toLocaleTimeString('ru')} · Публичный режим · Авто-обновление 1 мин
      </div>
    </div>
  )
}
