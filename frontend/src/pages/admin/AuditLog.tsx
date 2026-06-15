import { useEffect, useState, useCallback } from 'react'
import { getAudit } from '@/api'
import type { AuditEntry } from '@/types'
import Skeleton from '@/components/ui/Skeleton'

const ACTION_META: Record<string, { label: string; cls: string }> = {
  create:         { label: 'Создание',    cls: 'text-green-600 bg-green-50 border-green-200' },
  update:         { label: 'Изменение',   cls: 'text-svep-accent bg-svep-accent-light border-svep-accent/20' },
  delete:         { label: 'Удаление',    cls: 'text-red-600 bg-red-50 border-red-200' },
  reset_password: { label: 'Сброс пароля',cls: 'text-amber-600 bg-yellow-50 border-yellow-200' },
  login:          { label: 'Вход',        cls: 'text-svep-secondary bg-gray-100 border-svep-border' },
}

const ENTITY_LABEL: Record<string, string> = {
  user: 'Пользователь', kpi_value: 'KPI значение',
  indicator: 'Индикатор', kaizen: 'Кайдзен',
}

const PAGE_SIZE = 30

function DiffCell({ old: o, nw }: { old: any; nw: any }) {
  if (!o && !nw) return <span className="text-svep-tertiary">—</span>
  const keys = [...new Set([...Object.keys(o ?? {}), ...Object.keys(nw ?? {})])]
    .filter(k => !['password_hash','id'].includes(k) && o?.[k] !== nw?.[k])
  if (!keys.length) return <span className="text-svep-tertiary text-xs">без изменений</span>
  return (
    <div className="space-y-0.5">
      {keys.slice(0, 4).map(k => (
        <div key={k} className="flex gap-1.5 text-xs">
          <span className="text-svep-tertiary">{k}:</span>
          {o?.[k] !== undefined && <span className="line-through text-red-400">{String(o[k])}</span>}
          {nw?.[k] !== undefined && <span className="text-green-600">{String(nw[k])}</span>}
        </div>
      ))}
      {keys.length > 4 && <div className="text-svep-tertiary text-xs">+{keys.length - 4} ещё</div>}
    </div>
  )
}

export default function AuditLog() {
  const [rows,    setRows]    = useState<AuditEntry[]>([])
  const [total,   setTotal]   = useState(0)
  const [page,    setPage]    = useState(0)
  const [loading, setLoading] = useState(true)
  const [entity,  setEntity]  = useState('')
  const [action,  setAction]  = useState('')

  const load = useCallback(() => {
    setLoading(true)
    getAudit({ entity: entity || undefined, action: action || undefined, limit: PAGE_SIZE, offset: page * PAGE_SIZE })
      .then(d => { setRows(d.rows); setTotal(d.total) })
      .finally(() => setLoading(false))
  }, [entity, action, page])

  useEffect(() => { setPage(0) }, [entity, action])
  useEffect(() => { load() }, [load])

  const pages = Math.ceil(total / PAGE_SIZE)

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-svep-primary">Журнал аудита</h2>
          <p className="text-svep-tertiary text-sm mt-0.5">{total} записей</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <select value={entity} onChange={e => setEntity(e.target.value)}
            className="input-light">
            <option value="">Все объекты</option>
            {Object.entries(ENTITY_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <select value={action} onChange={e => setAction(e.target.value)}
            className="input-light">
            <option value="">Все действия</option>
            {Object.entries(ACTION_META).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
          </select>
          <button onClick={() => load()} className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 border border-svep-border text-svep-secondary hover:text-svep-primary transition-colors">
            ↻ Обновить
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-svep-surface border border-svep-border rounded-lg p-3"><Skeleton /></div>
        ))}</div>
      ) : rows.length === 0 ? (
        <div className="text-center py-16 text-svep-tertiary">
          <div className="text-4xl mb-3">📋</div>
          <div>Записей аудита нет</div>
        </div>
      ) : (
        <>
          <div className="bg-svep-surface border border-svep-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-svep-border">
                  {['Дата/время','Пользователь','Действие','Объект','Изменения','IP'].map(h => (
                    <th key={h} className="text-left py-2.5 px-4 text-svep-tertiary font-medium text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(r => {
                  const am = ACTION_META[r.action] ?? { label: r.action, cls: 'text-svep-secondary bg-gray-100 border-svep-border' }
                  return (
                    <tr key={r.id} className="border-b border-svep-border hover:bg-gray-50">
                      <td className="py-2.5 px-4 text-svep-tertiary text-xs whitespace-nowrap">
                        {new Date(r.created_at).toLocaleString('ru', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })}
                      </td>
                      <td className="py-2.5 px-4 text-svep-primary text-xs">
                        <div>{r.user_name}</div>
                        {r.user_id && <div className="text-svep-tertiary">#{r.user_id}</div>}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${am.cls}`}>
                          {am.label}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-xs">
                        <div className="text-svep-primary">{ENTITY_LABEL[r.entity] ?? r.entity}</div>
                        {r.entity_id && <div className="text-svep-tertiary">#{r.entity_id}</div>}
                      </td>
                      <td className="py-2.5 px-4 max-w-[240px]">
                        <DiffCell old={r.old_value} nw={r.new_value} />
                      </td>
                      <td className="py-2.5 px-4 text-svep-tertiary text-xs">{r.ip ?? '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Пагинация */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 rounded-lg bg-gray-100 text-svep-secondary hover:text-svep-primary disabled:opacity-40 text-sm">
                ← Пред.
              </button>
              <span className="text-svep-secondary text-sm">{page + 1} / {pages}</span>
              <button disabled={page >= pages - 1} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 rounded-lg bg-gray-100 text-svep-secondary hover:text-svep-primary disabled:opacity-40 text-sm">
                След. →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
