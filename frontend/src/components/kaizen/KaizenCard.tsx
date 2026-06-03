import clsx from 'clsx'
import type { KaizenItem } from '@/types'
import api from '@/api/client'
import { useState } from 'react'
import { useAuthStore } from '@/store/auth'

const STATUS_META = {
  new:         { label: 'Новое',       cls: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  in_progress: { label: 'В работе',    cls: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
  done:        { label: 'Выполнено',   cls: 'bg-green-500/20 text-green-300 border-green-500/30' },
  rejected:    { label: 'Отклонено',   cls: 'bg-red-500/20 text-red-300 border-red-500/30' },
}

const IMPACT_STARS = (n: number | null) =>
  n ? '★'.repeat(n) + '☆'.repeat(5 - n) : '☆☆☆☆☆'

interface Props {
  item: KaizenItem
  onUpdated: () => void
}

export default function KaizenCard({ item, onUpdated }: Props) {
  const { user } = useAuthStore()
  const canManage = user && ['admin', 'dept_head', 'management'].includes(user.role)
  const [updating, setUpdating] = useState(false)

  const changeStatus = async (status: KaizenItem['status']) => {
    setUpdating(true)
    await api.patch(`/kaizen/${item.id}`, { status })
    setUpdating(false)
    onUpdated()
  }

  const meta = STATUS_META[item.status]
  const date = new Date(item.created_at).toLocaleDateString('ru', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <span className={clsx('text-xs px-2 py-0.5 rounded-full border font-medium', meta.cls)}>
            {meta.label}
          </span>
          {item.domain_name && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700">
              {item.domain_name}
            </span>
          )}
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800/60 text-gray-500 border border-gray-700/50">
            {item.dept_name}
          </span>
        </div>
        <span className="text-xs text-gray-600 shrink-0">{date}</span>
      </div>

      <div>
        <div className="text-white font-medium leading-snug">{item.title}</div>
        {item.description && (
          <div className="text-gray-400 text-sm mt-1.5 line-clamp-2">{item.description}</div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{item.author_name ? `✍ ${item.author_name}` : '✍ Аноним'}</span>
        <span className="text-amber-400/80">{IMPACT_STARS(item.impact_score)}</span>
      </div>

      {canManage && item.status === 'new' && (
        <div className="flex gap-2 pt-1 border-t border-gray-800">
          <button
            disabled={updating}
            onClick={() => changeStatus('in_progress')}
            className="flex-1 text-xs py-1.5 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 border border-yellow-500/20 transition-colors disabled:opacity-50"
          >
            В работу
          </button>
          <button
            disabled={updating}
            onClick={() => changeStatus('done')}
            className="flex-1 text-xs py-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-300 border border-green-500/20 transition-colors disabled:opacity-50"
          >
            Выполнено
          </button>
          <button
            disabled={updating}
            onClick={() => changeStatus('rejected')}
            className="flex-1 text-xs py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 transition-colors disabled:opacity-50"
          >
            Отклонить
          </button>
        </div>
      )}
      {canManage && item.status === 'in_progress' && (
        <div className="flex gap-2 pt-1 border-t border-gray-800">
          <button
            disabled={updating}
            onClick={() => changeStatus('done')}
            className="flex-1 text-xs py-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-300 border border-green-500/20 transition-colors disabled:opacity-50"
          >
            Выполнено
          </button>
          <button
            disabled={updating}
            onClick={() => changeStatus('rejected')}
            className="flex-1 text-xs py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 transition-colors disabled:opacity-50"
          >
            Отклонить
          </button>
        </div>
      )}
    </div>
  )
}
