import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getMaster } from '@/api'
import type { MasterResponse } from '@/types'
import ScoreCell from '@/components/ui/ScoreCell'

export default function DomainPage() {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<MasterResponse | null>(null)

  useEffect(() => { getMaster().then(setData) }, [])

  const domain = data?.domains.find(d => d.code === id)

  const sorted = data
    ? [...data.departments].sort((a, b) => {
        const sa = a.domains[id ?? '']?.score ?? -1
        const sb = b.domains[id ?? '']?.score ?? -1
        return sb - sa
      })
    : []

  return (
    <div className="px-4 max-w-screen-xl mx-auto pb-12 pt-6">
      <div className="py-6">
        <div className="text-gray-500 text-sm mb-2">
          <Link to="/" className="hover:text-gray-300">Экосистема</Link> / Домен
        </div>
        {domain && (
          <>
            <div className="flex items-center gap-3">
              <span className="text-4xl">{domain.icon}</span>
              <h1 className="text-3xl font-bold text-white">{domain.name_ru}</h1>
            </div>
          </>
        )}
      </div>

      {!data ? (
        <div className="text-gray-500 text-center py-20">Загрузка…</div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sorted.map(dept => (
            <Link key={dept.id} to={`/dept/${dept.id}`} className="group">
              <ScoreCell
                score={dept.domains[id ?? '']?.score ?? null}
                label={dept.name_short}
                className="h-24 group-hover:scale-105 transition-transform"
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
