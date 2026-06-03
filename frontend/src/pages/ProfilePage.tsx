import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import api from '@/api/client'

const ROLE_LABELS: Record<string, string> = {
  admin:     'Администратор',
  dept_head: 'Начальник отдела',
  management:'Руководство',
  public:    'Публичный',
}

export default function ProfilePage() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [pwForm, setPwForm]   = useState({ old: '', new1: '', new2: '' })
  const [saving, setSaving]   = useState(false)
  const [msg,    setMsg]      = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  if (!user) {
    return (
      <div className="pt-32 text-center text-gray-500">
        <div className="text-4xl mb-4">🔒</div>
        <div className="text-lg text-white mb-2">Вы не авторизованы</div>
        <Link to="/login" className="text-blue-400 hover:text-blue-300">Войти →</Link>
      </div>
    )
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pwForm.new1 !== pwForm.new2) {
      setMsg({ type: 'err', text: 'Новые пароли не совпадают' })
      return
    }
    if (pwForm.new1.length < 8) {
      setMsg({ type: 'err', text: 'Пароль должен быть не менее 8 символов' })
      return
    }
    setSaving(true); setMsg(null)
    try {
      await api.post('/auth/change-password', { oldPassword: pwForm.old, newPassword: pwForm.new1 })
      setMsg({ type: 'ok', text: 'Пароль успешно изменён' })
      setPwForm({ old: '', new1: '', new2: '' })
    } catch (err: any) {
      setMsg({ type: 'err', text: err.response?.data?.error ?? 'Ошибка смены пароля' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="pt-20 px-4 max-w-2xl mx-auto pb-12">
      <div className="py-6">
        <h1 className="text-2xl font-bold text-white">Профиль</h1>
      </div>

      {/* Карточка пользователя */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-blue-700 flex items-center justify-center text-2xl font-bold text-white">
            {user.name[0].toUpperCase()}
          </div>
          <div>
            <div className="text-xl font-bold text-white">{user.name}</div>
            <div className="text-gray-400 text-sm">{user.email}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Роль',   value: ROLE_LABELS[user.role] ?? user.role },
            { label: 'ID',     value: `#${user.sub}` },
            { label: 'Отдел',  value: user.dept_id ? `ID ${user.dept_id}` : 'Все отделы' },
            { label: 'Доступ', value: user.role === 'admin' ? 'Полный' : user.role === 'management' ? 'Просмотр все' : 'Свой отдел' },
          ].map(f => (
            <div key={f.label} className="bg-gray-800/50 rounded-xl p-3">
              <div className="text-xs text-gray-500 mb-0.5">{f.label}</div>
              <div className="text-white font-medium">{f.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Смена пароля */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Изменить пароль</h2>
        <form onSubmit={handleChangePassword} className="space-y-3">
          {msg && (
            <div className={`text-sm rounded-lg px-4 py-2.5 ${
              msg.type === 'ok'
                ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                : 'bg-red-500/10 border border-red-500/30 text-red-400'
            }`}>
              {msg.text}
            </div>
          )}
          {[
            { key: 'old',  label: 'Текущий пароль',  field: 'old' },
            { key: 'new1', label: 'Новый пароль',     field: 'new1' },
            { key: 'new2', label: 'Повторите новый',  field: 'new2' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs text-gray-400 mb-1.5">{f.label}</label>
              <input
                type="password"
                value={pwForm[f.field as keyof typeof pwForm]}
                onChange={e => setPwForm(p => ({ ...p, [f.field]: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            {saving ? 'Сохранение…' : 'Сменить пароль'}
          </button>
        </form>
      </div>

      {/* Выход */}
      <div className="bg-gray-900 border border-red-900/40 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-2">Сессия</h2>
        <p className="text-gray-400 text-sm mb-4">Выйти из всех устройств</p>
        <button
          onClick={() => { logout(); navigate('/') }}
          className="bg-red-600/20 hover:bg-red-600/40 border border-red-600/40 text-red-400 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Выйти из системы
        </button>
      </div>
    </div>
  )
}
