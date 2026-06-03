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
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-3 py-2">{error}</div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">Отдел *</label>
          <select value={deptId} onChange={e => setDeptId(+e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500">
            {departments.map(d => <option key={d.id} value={d.id}>{d.name_short}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">Домен</label>
          <select value={domainId} onChange={e => setDomainId(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500">
            <option value="">— Не выбран —</option>
            {domains.map(d => <option key={d.id} value={d.id}>{d.name_ru}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1.5">Заголовок *</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          maxLength={200}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
          placeholder="Краткое описание улучшения…"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1.5">Подробное описание</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
          placeholder="Проблема, предлагаемое решение, ожидаемый эффект…"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1.5">Автор</label>
        <input
          type="text"
          value={authorName}
          onChange={e => setAuthorName(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
          placeholder="Имя сотрудника"
        />
      </div>

      <div className="flex gap-2 justify-end pt-1">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-400 hover:text-white bg-gray-800 rounded-lg transition-colors">
          Отмена
        </button>
        <button type="submit" disabled={saving || !title.trim()} className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg transition-colors font-medium">
          {saving ? 'Отправка…' : 'Отправить'}
        </button>
      </div>
    </form>
  )
}
