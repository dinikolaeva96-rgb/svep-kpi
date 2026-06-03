import { useEffect, useState, useCallback } from 'react'
import { getUsers, getDepartments, createUser, patchUser, deleteUser, resetPassword } from '@/api'
import type { UserRecord, Department } from '@/types'
import Modal    from '@/components/ui/Modal'
import Skeleton from '@/components/ui/Skeleton'
import UserForm from '@/components/forms/UserForm'

const ROLE_BADGE: Record<string, string> = {
  admin:     'bg-red-500/20 text-red-300 border-red-500/30',
  management:'bg-purple-500/20 text-purple-300 border-purple-500/30',
  dept_head: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  public:    'bg-gray-700/40 text-gray-400 border-gray-600/30',
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
          <h2 className="text-xl font-bold text-white">Пользователи</h2>
          <p className="text-gray-500 text-sm mt-0.5">{users.length} учётных записей</p>
        </div>
        <div className="flex gap-2">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Поиск…"
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 w-44" />
          <button onClick={() => setCreating(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            + Новый
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4"><Skeleton lines={2} /></div>
        ))}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                {['ID','Имя','Email','Роль','Отдел','Статус','Последний вход',''].map(h => (
                  <th key={h} className="py-2 pr-4 text-gray-500 font-medium text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className={`border-b border-gray-800/50 hover:bg-gray-800/30 ${!u.is_active ? 'opacity-50' : ''}`}>
                  <td className="py-3 pr-4 text-gray-600 text-xs">#{u.id}</td>
                  <td className="py-3 pr-4 text-white font-medium">{u.name}</td>
                  <td className="py-3 pr-4 text-gray-400">{u.email}</td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${ROLE_BADGE[u.role] ?? ''}`}>
                      {ROLE_LABEL[u.role] ?? u.role}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-gray-400">{u.dept_name ?? '—'}</td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs font-medium ${u.is_active ? 'text-green-400' : 'text-red-400'}`}>
                      {u.is_active ? '● Активен' : '○ Неактивен'}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-gray-600 text-xs">
                    {u.last_login ? new Date(u.last_login).toLocaleDateString('ru') : '—'}
                  </td>
                  <td className="py-3">
                    <div className="flex gap-1">
                      <button onClick={() => setEditing(u)}
                        className="text-xs px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors">
                        ✏️
                      </button>
                      <button onClick={() => { setResetId(u.id); setNewPw(''); setResetMsg('') }}
                        className="text-xs px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-yellow-400 transition-colors"
                        title="Сбросить пароль">
                        🔑
                      </button>
                      <button onClick={() => handleToggle(u)}
                        className={`text-xs px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 transition-colors ${u.is_active ? 'text-orange-400' : 'text-green-400'}`}
                        title={u.is_active ? 'Деактивировать' : 'Активировать'}>
                        {u.is_active ? '⏸' : '▶'}
                      </button>
                      <button onClick={() => handleDelete(u)}
                        className="text-xs px-2 py-1 rounded bg-gray-800 hover:bg-red-900/40 text-red-400 transition-colors"
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
          {resetMsg && <div className="text-red-400 text-sm">{resetMsg}</div>}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Новый пароль (мин. 8 симв.)</label>
            <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setResetId(null)}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white bg-gray-800 rounded-lg">Отмена</button>
            <button onClick={handleReset}
              className="px-4 py-2 text-sm text-white bg-yellow-600 hover:bg-yellow-500 rounded-lg font-medium">
              Сбросить
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
