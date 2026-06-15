import { useEffect, useState, useCallback } from 'react'
import { getUsers, getDepartments, createUser, patchUser, deleteUser, resetPassword } from '@/api'
import type { UserRecord, Department } from '@/types'
import Modal    from '@/components/ui/Modal'
import Skeleton from '@/components/ui/Skeleton'
import UserForm from '@/components/forms/UserForm'

const ROLE_BADGE: Record<string, string> = {
  admin:     'bg-red-50 text-red-600 border-red-200',
  management:'bg-purple-50 text-purple-600 border-purple-200',
  dept_head: 'bg-svep-accent-light text-svep-accent border-svep-accent/20',
  public:    'bg-gray-100 text-svep-secondary border-svep-border',
}

const ROLE_LABEL: Record<string, string> = {
  admin: 'Администратор', management: 'Руководство',
  dept_head: 'Нач. отдела', public: 'Публичный',
}

export default function UsersAdmin() {
  const [users,   setUsers]   = useState<UserRecord[]>([])
  const [depts,   setDepts]   = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<UserRecord | null>(null)
  const [creating,setCreating]= useState(false)
  const [resetId, setResetId] = useState<number | null>(null)
  const [newPw,   setNewPw]   = useState('')
  const [resetMsg,setResetMsg]= useState('')
  const [search,  setSearch]  = useState('')

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([getUsers(), getDepartments()])
      .then(([u, d]) => { setUsers(u); setDepts(d) })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = users.filter(u =>
    !search ||
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = async (data: any) => {
    await createUser(data)
    setCreating(false); load()
  }

  const handleUpdate = async (data: any) => {
    if (!editing) return
    await patchUser(editing.id, data)
    setEditing(null); load()
  }

  const handleToggle = async (u: UserRecord) => {
    if (!confirm(`${u.is_active ? 'Деактивировать' : 'Активировать'} пользователя ${u.name}?`)) return
    await patchUser(u.id, { is_active: u.is_active ? 0 : 1 } as any)
    load()
  }

  const handleDelete = async (u: UserRecord) => {
    if (!confirm(`Удалить пользователя ${u.name}? Это действие необратимо.`)) return
    await deleteUser(u.id)
    load()
  }

  const handleReset = async () => {
    if (!resetId || newPw.length < 8) { setResetMsg('Минимум 8 символов'); return }
    await resetPassword(resetId, newPw)
    setResetId(null); setNewPw(''); setResetMsg('')
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-svep-primary">Пользователи</h2>
          <p className="text-svep-tertiary text-sm mt-0.5">{users.length} учётных записей</p>
        </div>
        <div className="flex gap-2">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Поиск…"
            className="input-light w-44" />
          <button onClick={() => setCreating(true)}
            className="text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            style={{ backgroundColor: 'var(--accent)' }}>
            + Новый
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-svep-surface border border-svep-border rounded-xl p-4"><Skeleton lines={2} /></div>
        ))}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-svep-border text-left">
                {['ID','Имя','Email','Роль','Отдел','Статус','Последний вход',''].map(h => (
                  <th key={h} className="py-2 pr-4 text-svep-tertiary font-medium text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className={`border-b border-svep-border hover:bg-gray-50 ${!u.is_active ? 'opacity-50' : ''}`}>
                  <td className="py-3 pr-4 text-svep-tertiary text-xs">#{u.id}</td>
                  <td className="py-3 pr-4 text-svep-primary font-medium">{u.name}</td>
                  <td className="py-3 pr-4 text-svep-secondary">{u.email}</td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${ROLE_BADGE[u.role] ?? ''}`}>
                      {ROLE_LABEL[u.role] ?? u.role}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-svep-secondary">{u.dept_name ?? '—'}</td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs font-medium ${u.is_active ? 'text-green-600' : 'text-red-600'}`}>
                      {u.is_active ? '● Активен' : '○ Неактивен'}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-svep-tertiary text-xs">
                    {u.last_login ? new Date(u.last_login).toLocaleDateString('ru') : '—'}
                  </td>
                  <td className="py-3">
                    <div className="flex gap-1">
                      <button onClick={() => setEditing(u)}
                        className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-svep-secondary transition-colors">
                        ✏️
                      </button>
                      <button onClick={() => { setResetId(u.id); setNewPw(''); setResetMsg('') }}
                        className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-amber-600 transition-colors"
                        title="Сбросить пароль">
                        🔑
                      </button>
                      <button onClick={() => handleToggle(u)}
                        className={`text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 transition-colors ${u.is_active ? 'text-orange-500' : 'text-green-600'}`}
                        title={u.is_active ? 'Деактивировать' : 'Активировать'}>
                        {u.is_active ? '⏸' : '▶'}
                      </button>
                      <button onClick={() => handleDelete(u)}
                        className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-red-50 text-red-500 transition-colors"
                        title="Удалить">
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Создание */}
      <Modal open={creating} onClose={() => setCreating(false)} title="Новый пользователь">
        <UserForm departments={depts} isNew onSubmit={handleCreate} onCancel={() => setCreating(false)} />
      </Modal>

      {/* Редактирование */}
      <Modal open={editing !== null} onClose={() => setEditing(null)} title="Редактировать пользователя">
        {editing && (
          <UserForm initial={editing} departments={depts} onSubmit={handleUpdate} onCancel={() => setEditing(null)} />
        )}
      </Modal>

      {/* Сброс пароля */}
      <Modal open={resetId !== null} onClose={() => setResetId(null)} title="Сброс пароля">
        <div className="space-y-4">
          {resetMsg && <div className="text-red-600 text-sm">{resetMsg}</div>}
          <div>
            <label className="block text-xs text-svep-secondary mb-1.5">Новый пароль (мин. 8 симв.)</label>
            <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
              className="input-light w-full" />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setResetId(null)}
              className="px-4 py-2 text-sm text-svep-secondary hover:text-svep-primary bg-gray-100 rounded-lg">Отмена</button>
            <button onClick={handleReset}
              className="px-4 py-2 text-sm text-white bg-amber-500 hover:bg-amber-600 rounded-lg font-medium">
              Сбросить
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
