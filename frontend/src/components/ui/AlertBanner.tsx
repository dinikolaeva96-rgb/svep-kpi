import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAlerts } from '@/api'
import type { AlertsResponse } from '@/types'

export default function AlertBanner() {
  const [data, setData] = useState<AlertsResponse | null>(null)

  useEffect(() => {
    getAlerts().then(setData).catch(() => {})
  }, [])

  if (!data || (data.summary.red === 0 && data.summary.yellow === 0)) return null

  return (
    <div className="mx-4 mt-2 max-w-screen-xl xl:mx-auto">
      <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm ${
        data.summary.red > 0
          ? 'bg-red-500/10 border-red-500/30 text-red-300'
          : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300'
      }`}>
        <span className="text-base">{data.summary.red > 0 ? '🚨' : '⚠️'}</span>
        <span className="flex-1">
          {data.summary.red > 0 && (
            <span className="font-bold text-red-400 mr-2">{data.summary.red} критичных</span>
          )}
          {data.summary.yellow > 0 && (
            <span className="font-semibold text-yellow-400 mr-2">{data.summary.yellow} предупреждений</span>
          )}
          <span className="text-gray-400">требуют внимания в текущем периоде</span>
        </span>
        <Link to="/alerts" className="shrink-0 text-xs underline hover:no-underline opacity-80 hover:opacity-100">
          Смотреть все →
        </Link>
      </div>
    </div>
  )
}
