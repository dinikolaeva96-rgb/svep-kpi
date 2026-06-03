import { useState } from 'react'
import api from '@/api/client'
import type { Indicator } from '@/types'

interface Props {
  indicator: Indicator
  deptId: number | string
  year: number
  month: number
  initialActual?: number | null
  initialPlan?: number | null
  onSaved: () => void
  onCancel: () => void
}

export default function KpiEntryForm({ indicator, deptId, year, month, initialActual, initialPlan, onSaved, onCancel }: Props) {
  const [actual,  setActual]  = useState(initialActual  != null ? String(initialActual)  : '')
  const [plan,    setPlan]    = useState(initialPlan    != null ? String(initialPlan)    : String(indicator.target))
  const [comment, setComment] = useState('')
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')

  const MONTH_NAMES = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек']

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.put(`/kpi/${deptId}/${indicator.id}`, {
        year, month,
        actual:  actual  !== '' ? parseFloat(actual)  : null,
        plan:    plan    !== '' ? parseFloat(plan)    : null,
        comment: comment || null,
      })
      onSaved()
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="bg-gray-800/50 rounded-lg p-3 text-sm">
        <div className="text-white font-medium">{indicator.name}</div>
        <div className="text-gray-400 text-xs mt-1">
          {MONTH_NAMES[month - 1]} {year} · Единица: {indicator.unit} · Цель: {indicator.target}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-3 py-2">{error}</div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">Факт ({indicator.unit})</label>
          <input
            type="number"
            step="any"
            value={actual}
            onChange={e => setActual(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            placeholder="—"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">План ({indicator.unit})</label>
          <input
            type="number"
            step="any"
            value={plan}
            onChange={e => setPlan(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1.5">Комментарий</label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={2}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
          placeholder="Необязательно…"
        />
      </div>

      <div className="flex gap-2 justify-end pt-1">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-400 hover:text-white bg-gray-800 rounded-lg transition-colors">
          Отмена
        </button>
        <button type="submit" disabled={saving} className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg transition-colors font-medium">
          {saving ? 'Сохранение…' : 'Сохранить'}
        </button>
      </div>
    </form>
  )
}
