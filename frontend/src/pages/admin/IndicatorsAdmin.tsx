import { useEffect, useState, useCallback } from 'react'
import { getIndicators, getDepartments, patchIndicator } from '@/api'
import type { IndicatorFull, Department } from '@/types'
import Skeleton from '@/components/ui/Skeleton'
import Modal    from '@/components/ui/Modal'

interface EditState {
  id: number
  name: string
  unit: string
  target: string
  warning_thr: string
  critical_thr: string
  weight: string
  description: string
}

function toEdit(ind: IndicatorFull): EditState {
  return {
    id: ind.id, name: ind.name, unit: ind.unit,
    target: String(ind.target), warning_thr: String(ind.warning_thr),
    critical_thr: String(ind.critical_thr), weight: String(ind.weight),
    description: ind.description ?? '',
  }
}

export default function IndicatorsAdmin() {
  const [indicators, setIndicators] = useState<IndicatorFull[]>([])
  const [depts,      setDepts]      = useState<Department[]>([])
  const [loading,    setLoading]    = useState(true)
  const [filterDept, setFilterDept] = useState('')
  const [editing,    setEditing]    = useState<EditState | null>(null)
  const [saving,     setSaving]     = useState(false)
  const [saveErr,    setSaveErr]    = useState('')
  const [saveOk,     setSaveOk]     = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([
      getIndicators(filterDept || undefined),
      getDepartments(),
    ]).then(([inds, ds]) => { setIndicators(inds); setDepts(ds) })
      .finally(() => setLoading(false))
  }, [filterDept])

  useEffect(() => { load() }, [load])

  const grouped: Record<string, IndicatorFull[]> = {}
  for (const ind of indicators) {
    const k = ind.dept_name
    if (!grouped[k]) grouped[k] = []
    grouped[k].push(ind)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editing) return
    setSaving(true); setSaveErr(''); setSaveOk(false)
    try {
      await patchIndicator(editing.id, {
        name:         editing.name         || undefined,
        unit:         editing.unit         || undefined,
        target:       parseFloat(editing.target),
        warning_thr:  parseFloat(editing.warning_thr),
        critical_thr: parseFloat(editing.critical_thr),
        weight:       parseFloat(editing.weight),
        description:  editing.description  || undefined,
      } as any)
      setSaveOk(true)
      load()
      setTimeout(() => { setEditing(null); setSaveOk(false) }, 800)
    } catch (err: any) {
      setSaveErr(err.response?.data?.error ?? 'Ошибка')
    } finally {
      setSaving(false)
    }
  }

  const setF = (k: keyof EditState, v: string) =>
    setEditing(e => e ? { ...e, [k]: v } : null)

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Настройка индикаторов</h2>
          <p className="text-gray-500 text-sm mt-0.5">{indicators.length} показателей</p>
        </div>
        <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500">
          <option value="">Все отделы</option>
          {depts.map(d => <option key={d.id} value={d.id}>{d.name_short}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5"><Skeleton lines={4} /></div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).sort().map(([deptName, inds]) => (
            <div key={deptName} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-800 bg-gray-800/40">
                <span className="font-semibold text-white">{deptName}</span>
                <span className="text-gray-500 text-xs ml-2">{inds.length} показателей</span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800/60">
                    {['Показатель','Домен','Цель','Предупр.','Критично','Вес',''].map(h => (
                      <th key={h} className="text-left py-2 px-4 text-gray-500 font-medium text-xs">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {inds.map(ind => (
                    <tr key={ind.id} className="border-b border-gray-800/30 hover:bg-gray-800/20">
                      <td className="py-2.5 px-4">
                        <div className="text-white font-medium">{ind.name}</div>
                        <div className="text-xs text-gray-600">{ind.unit}</div>
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ backgroundColor: ind.domain_color + '25', color: ind.domain_color, border: `1px solid ${ind.domain_color}35` }}>
                          {ind.domain_name}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-green-400 font-mono">{ind.target}</td>
                      <td className="py-2.5 px-4 text-yellow-400 font-mono">{ind.warning_thr}</td>
                      <td className="py-2.5 px-4 text-red-400 font-mono">{ind.critical_thr}</td>
                      <td className="py-2.5 px-4 text-gray-400 font-mono">{ind.weight}</td>
                      <td className="py-2.5 px-4">
                        <button onClick={() => setEditing(toEdit(ind))}
                          className="text-xs px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors">
                          ✏️ Изменить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {/* Модал редактирования */}
      <Modal open={editing !== null} onClose={() => setEditing(null)} title="Редактировать показатель">
        {editing && (
          <form onSubmit={handleSave} className="space-y-4">
            {saveErr && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-3 py-2">{saveErr}</div>}
            {saveOk  && <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-lg px-3 py-2">✓ Сохранено</div>}

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs text-gray-400 mb-1.5">Название</label>
                <input value={editing.name} onChange={e => setF('name', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Единица измерения</label>
                <input value={editing.unit} onChange={e => setF('unit', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Вес (0–5)</label>
                <input type="number" step="0.1" min="0" max="5" value={editing.weight} onChange={e => setF('weight', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
              </div>

              <div>
                <label className="block text-xs text-green-400 mb-1.5">Цель ✓</label>
                <input type="number" step="any" value={editing.target} onChange={e => setF('target', e.target.value)} required
                  className="w-full bg-gray-800 border border-green-800/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500" />
              </div>

              <div>
                <label className="block text-xs text-yellow-400 mb-1.5">Порог предупреждения ⚠</label>
                <input type="number" step="any" value={editing.warning_thr} onChange={e => setF('warning_thr', e.target.value)} required
                  className="w-full bg-gray-800 border border-yellow-800/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500" />
              </div>

              <div>
                <label className="block text-xs text-red-400 mb-1.5">Критический порог 🚨</label>
                <input type="number" step="any" value={editing.critical_thr} onChange={e => setF('critical_thr', e.target.value)} required
                  className="w-full bg-gray-800 border border-red-800/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500" />
              </div>

              <div className="col-span-2">
                <label className="block text-xs text-gray-400 mb-1.5">Описание</label>
                <textarea value={editing.description} onChange={e => setF('description', e.target.value)}
                  rows={2} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 resize-none" />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-1">
              <button type="button" onClick={() => setEditing(null)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white bg-gray-800 rounded-lg">Отмена</button>
              <button type="submit" disabled={saving}
                className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg font-medium">
                {saving ? 'Сохранение…' : 'Сохранить'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
