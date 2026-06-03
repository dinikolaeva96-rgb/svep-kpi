import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDepartments, getMaster } from '@/api'
import type { MasterResponse } from '@/types'

const DOMAIN_META = [
  { code: 'quality',    icon: '🏆', label: 'Качество' },
  { code: 'delivery',   icon: '⏱️', label: 'Сроки' },
  { code: 'cost',       icon: '💰', label: 'Затраты' },
  { code: 'safety',     icon: '🛡️', label: 'Безопасность' },
  { code: 'morale',     icon: '❤️', label: 'Вовлечённость' },
  { code: 'innovation', icon: '💡', label: 'Инновации' },
]

export default function Home() {
  const [master, setMaster] = useState<MasterResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMaster().then(setMaster).finally(() => setLoading(false))
  }, [])

  const totalDepts   = master?.departments.length ?? 0
  const avgScore = master
    ? Math.round(
        master.departments
          .map(d => d.overall_score ?? 0)
          .reduce((a, b) => a + b, 0) / (master.departments.length || 1)
      )
    : null

  const domainAvgs = master
    ? DOMAIN_META.map(dm => {
        const vals = master.departments
          .map(d => d.domains[dm.code]?.score)
          .filter((v): v is number => v !== null && v !== undefined)
        return { ...dm, avg: vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null }
      })
    : DOMAIN_META.map(dm => ({ ...dm, avg: null }))

  return (
    <div className="pt-20 px-4 max-w-screen-xl mx-auto">
      {/* Hero */}
      <section className="py-12 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-900/30 border border-blue-700/40 rounded-full px-4 py-1.5 text-blue-300 text-sm mb-6">
          <span>⚡</span> ООО «Средневолжскэлектропроект» · Казань
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Экосистема <span className="text-amber-400">СВЭП</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10">
          Единая система KPI для {totalDepts} отделов, {106} сотрудников.
          Проектирование электросетей 0.4–220 кВ.
        </p>

        {/* Hero metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-10">
          {[
            { label: 'Отделов', value: '16' },
            { label: 'Сотрудников', value: '106' },
            { label: 'Средний KPI', value: avgScore !== null ? `${avgScore}%` : '…' },
            { label: 'Домены', value: '6' },
          ].map(m => (
            <div key={m.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="text-2xl font-bold text-white">{m.value}</div>
              <div className="text-xs text-gray-500 mt-1">{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 6 доменов */}
      <section className="mb-16">
        <h2 className="text-xl font-semibold text-gray-200 mb-6">6 lean-доменов</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {domainAvgs.map(d => (
            <Link
              key={d.code}
              to={`/domain/${d.code}`}
              className="group bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl p-5 text-center transition-all hover:-translate-y-1"
            >
              <div className="text-3xl mb-3">{d.icon}</div>
              <div className="text-sm font-medium text-gray-300 group-hover:text-white">{d.label}</div>
              {d.avg !== null ? (
                <div className={`text-lg font-bold mt-2 ${d.avg >= 80 ? 'text-green-400' : d.avg >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {d.avg}%
                </div>
              ) : (
                <div className="text-gray-600 mt-2">—</div>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* Отделы */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-200">Отделы</h2>
          <Link to="/master" className="text-sm text-blue-400 hover:text-blue-300">
            Мастер-карта →
          </Link>
        </div>
        {loading ? (
          <div className="text-gray-500 text-center py-12">Загрузка…</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {master?.departments.map(dept => {
              const score = dept.overall_score
              const color = score === null ? 'text-gray-500' : score >= 80 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400'
              return (
                <Link
                  key={dept.id}
                  to={`/dept/${dept.id}`}
                  className="bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl p-4 text-center transition-all hover:-translate-y-1 group"
                >
                  <div className="text-base font-bold text-white group-hover:text-amber-400">{dept.name_short}</div>
                  <div className="text-xs text-gray-500 mt-1 truncate">{dept.staff_count} чел.</div>
                  <div className={`text-sm font-semibold mt-2 ${color}`}>
                    {score !== null ? `${score}%` : '—'}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
