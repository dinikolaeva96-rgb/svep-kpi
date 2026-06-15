import clsx from 'clsx'
import type { KaizenItem } from '@/types'
import api from '@/api/client'
import { useState } from 'react'
import { useAuthStore } from '@/store/auth'

const STATUS_META = {
  new:         { label: 'Новое',     cls: 'bg-svep-accent-light text-svep-accent border-svep-accent/20' },
  in_progress: { label: 'В работе',  cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  done:        { label: 'Выполнено', cls: 'bg-green-50 text-green-700 border-green-200' },
  rejected:    { label: 'Отклонено', cls: 'bg-red-50 text-red-700 border-red-200' },
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

  const meta = STATUS_META[item.status] ?? STATUS_META.new
  const date = new Date(item.created_at).toLocaleDateString('ru', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="bg-svep-surface border border-svep-border rounded-xl p-5 flex flex-col gap-3 hover:border-svep-accent/40 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <span className={clsx('text-xs px-2 py-0.5 rounded-full border font-medium', meta.cls)}>
            {meta.label}
          </span>
          {item.domain_name && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-svep-secondary border border-svep-border">
              {item.domain_name}
            </span>
          )}
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-50 text-svep-tertiary border border-svep-border">
            {item.dept_name}
          </span>
        </div>
        <span className="eyebrow shrink-0">{date}</span>
      </div>

      <div>
        <div className="text-svep-primary font-medium leading-snug">{item.title}</div>
        {item.description && (
          <div className="text-svep-secondary text-sm mt-1.5 line-clamp-2">{item.description}</div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-svep-tertiary">
        <span>{item.author_name ? `✍ ${item.author_name}` : '✍ Аноним'}</span>
        <span className="text-svep-accent/70 mono-num">{IMPACT_STARS(item.impact_score)}</span>
      </div>

      {canManage && item.status === 'new' && (
        <div className="flex gap-2 pt-2 border-t border-svep-border">
          <button disabled={updating} onClick={() => changeStatus('in_progress')}
            className="flex-1 text-xs py-1.5 rounded-lg bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border border-yellow-200 transition-colors disabled:opacity-50">
            В работу
          </button>
          <button disabled={updating} onClick={() => changeStatus('done')}
            className="flex-1 text-xs py-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 transition-colors disabled:opacity-50">
            Выполнено
          </button>
          <button disabled={updating} onClick={() => changeStatus('rejected')}
            className="flex-1 text-xs py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors disabled:opacity-50">
            Отклонить
          </button>
        </div>
      )}
      {canManage && item.status === 'in_progress' && (
        <div className="flex gap-2 pt-2 border-t border-svep-border">
          <button disabled={updating} onClick={() => changeStatus('done')}
            className="flex-1 text-xs py-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 transition-colors disabled:opacity-50">
            Выполнено
          </button>
          <button disabled={updating} onClick={() => changeStatus('rejected')}
            className="flex-1 text-xs py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors disabled:opacity-50">
            Отклонить
          </button>
        </div>
      )}
    </div>
  )
}
