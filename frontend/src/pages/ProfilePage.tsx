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
      <div className="pt-32 text-center text-svep-secondary">
        <div className="text-4xl mb-4">🔒</div>
        <div className="text-lg text-svep-primary mb-2">Вы не авторизованы</div>
        <Link to="/login" className="text-svep-accent hover:underline">Войти →</Link>
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
    <div className="pt-20 px-4 max-w-2xl mx-auto pb-12 bg-svep-bg min-h-screen">
      <div className="py-6">
        <h1 className="font-brutal font-extrabold text-2xl text-svep-primary">Профиль</h1>
      </div>

      {/* Карточка пользователя */}
      <div className="bg-svep-surface border border-svep-border rounded-xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold text-white"
            style={{ backgroundColor: 'var(--accent)' }}>
            {user.name[0].toUpperCase()}
          </div>
          <div>
            <div className="text-xl font-bold text-svep-primary">{user.name}</div>
            <div className="text-svep-secondary text-sm">{user.email}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Роль',   value: ROLE_LABELS[user.role] ?? user.role },
            { label: 'ID',     value: `#${user.sub}` },
            { label: 'Отдел',  value: user.dept_id ? `ID ${user.dept_id}` : 'Все отделы' },
            { label: 'Доступ', value: user.role === 'admin' ? 'Полный' : user.role === 'management' ? 'Просмотр все' : 'Свой отдел' },
          ].map(f => (
            <div key={f.label} className="bg-svep-bg rounded-xl p-3">
              <div className="eyebrow mb-0.5">{f.label}</div>
              <div className="text-svep-primary font-medium">{f.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Смена пароля */}
      <div className="bg-svep-surface border border-svep-border rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-svep-primary mb-4">Изменить пароль</h2>
        <form onSubmit={handleChangePassword} className="space-y-3">
          {msg && (
            <div className={`text-sm rounded-lg px-4 py-2.5 ${
              msg.type === 'ok'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
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
              <label className="block text-xs text-svep-secondary mb-1.5">{f.label}</label>
              <input
                type="password"
                value={pwForm[f.field as keyof typeof pwForm]}
                onChange={e => setPwForm(p => ({ ...p, [f.field]: e.target.value }))}
                className="input-light w-full"
                required
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={saving}
            className="w-full text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            {saving ? 'Сохранение…' : 'Сменить пароль'}
          </button>
        </form>
      </div>

      {/* Выход */}
      <div className="bg-svep-surface border border-red-100 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-svep-primary mb-2">Сессия</h2>
        <p className="text-svep-secondary text-sm mb-4">Выйти из всех устройств</p>
        <button
          onClick={() => { logout(); navigate('/') }}
          className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Выйти из системы
        </button>
      </div>
    </div>
  )
}
