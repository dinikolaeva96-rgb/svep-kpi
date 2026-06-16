import { useState } from 'react'
import type { UserRecord, Department } from '@/types'

const ROLES = [
  { value: 'public',     label: 'Публичный' },
  { value: 'dept_head',  label: 'Начальник отдела' },
  { value: 'management', label: 'Руководство' },
  { value: 'admin',      label: 'Администратор' },
]

interface Props {
  initial?: Partial<UserRecord>
  departments: Department[]
  isNew?: boolean
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
}

export default function UserForm({ initial, departments, isNew = false, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState({
    email:    initial?.email    ?? '',
    name:     initial?.name     ?? '',
    role:     initial?.role     ?? 'public',
    dept_id:  initial?.dept_id  ?? '',
    password: '',
  })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      await onSubmit({
        ...form,
        dept_id: form.dept_id !== '' ? Number(form.dept_id) : null,
        ...(isNew ? {} : { password: undefined }),
      })
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Ошибка')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2">{error}</div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs text-svep-tertiary mb-1.5">ФИО *</label>
          <input value={form.name} onChange={e => set('name', e.target.value)} required
            className="w-full input-light"
            placeholder="Иванов Иван Иванович" />
        </div>

        <div className="col-span-2">
          <label className="block text-xs text-svep-tertiary mb-1.5">Email *</label>
          <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
            required disabled={!isNew}
            className="w-full input-light disabled:opacity-50"
            placeholder="user@svep.ru" />
        </div>

        {isNew && (
          <div className="col-span-2">
            <label className="block text-xs text-svep-tertiary mb-1.5">Пароль * (мин. 8 симв.)</label>
            <input type="password" value={form.password} onChange={e => set('password', e.target.value)}
              required minLength={8}
              className="w-full input-light" />
          </div>
        )}

        <div>
          <label className="block text-xs text-svep-tertiary mb-1.5">Роль *</label>
          <select value={form.role} onChange={e => set('role', e.target.value)}
            className="w-full input-light">
            {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs text-svep-tertiary mb-1.5">Отдел</label>
          <select value={form.dept_id} onChange={e => set('dept_id', e.target.value)}
            className="w-full input-light">
            <option value="">— Все отделы —</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name_short} — {d.name_full}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-1">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 text-sm text-svep-secondary hover:text-svep-primary bg-svep-bg rounded-lg transition-colors">
          Отмена
        </button>
        <button type="submit" disabled={saving}
          style={{ backgroundColor: 'var(--accent)' }}
          className="px-4 py-2 text-sm text-white disabled:opacity-50 rounded-lg transition-colors font-medium">
          {saving ? 'Сохранение…' : isNew ? 'Создать' : 'Сохранить'}
        </button>
      </div>
    </form>
  )
}
