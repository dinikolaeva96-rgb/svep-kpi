import { useState } from 'react'
import api from '@/api/client'
import type { Department, Domain } from '@/types'

interface Props {
  departments: Department[]
  domains: Domain[]
  defaultDeptId?: number
  onCreated: () => void
  onCancel: () => void
}

export default function KaizenForm({ departments, domains, defaultDeptId, onCreated, onCancel }: Props) {
  const [deptId,     setDeptId]     = useState(defaultDeptId ?? departments[0]?.id ?? '')
  const [domainId,   setDomainId]   = useState<string>('')
  const [title,      setTitle]      = useState('')
  const [description,setDescription]= useState('')
  const [authorName, setAuthorName] = useState('')
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    setError('')
    try {
      await api.post('/kaizen', {
        dept_id:     deptId,
        domain_id:   domainId || null,
        title:       title.trim(),
        description: description.trim() || null,
        author_name: authorName.trim() || null,
      })
      onCreated()
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
        <div>
          <label className="block text-xs text-svep-tertiary mb-1.5">Отдел *</label>
          <select value={deptId} onChange={e => setDeptId(+e.target.value)}
            className="w-full input-light">
            {departments.map(d => <option key={d.id} value={d.id}>{d.name_short}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-svep-tertiary mb-1.5">Домен</label>
          <select value={domainId} onChange={e => setDomainId(e.target.value)}
            className="w-full input-light">
            <option value="">— Не выбран —</option>
            {domains.map(d => <option key={d.id} value={d.id}>{d.name_ru}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs text-svep-tertiary mb-1.5">Заголовок *</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          maxLength={200}
          className="w-full input-light"
          placeholder="Краткое описание улучшения…"
        />
      </div>

      <div>
        <label className="block text-xs text-svep-tertiary mb-1.5">Подробное описание</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
          className="w-full input-light resize-none"
          placeholder="Проблема, предлагаемое решение, ожидаемый эффект…"
        />
      </div>

      <div>
        <label className="block text-xs text-svep-tertiary mb-1.5">Автор</label>
        <input
          type="text"
          value={authorName}
          onChange={e => setAuthorName(e.target.value)}
          className="w-full input-light"
          placeholder="Имя сотрудника"
        />
      </div>

      <div className="flex gap-2 justify-end pt-1">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-svep-secondary hover:text-svep-primary bg-svep-bg rounded-lg transition-colors">
          Отмена
        </button>
        <button type="submit" disabled={saving || !title.trim()} style={{ backgroundColor: 'var(--accent)' }} className="px-4 py-2 text-sm text-white disabled:opacity-50 rounded-lg transition-colors font-medium">
          {saving ? 'Отправка…' : 'Отправить'}
        </button>
      </div>
    </form>
  )
}
