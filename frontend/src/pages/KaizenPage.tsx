import { useEffect, useState, useCallback } from 'react'
import { getDepartments, getKaizen } from '@/api'
import type { KaizenItem, Department, Domain } from '@/types'
import KaizenCard from '@/components/kaizen/KaizenCard'
import KaizenForm from '@/components/forms/KaizenForm'
import Modal      from '@/components/ui/Modal'
import Skeleton   from '@/components/ui/Skeleton'
import api        from '@/api/client'

const STATUSES = [
  { value: '',            label: 'Все статусы' },
  { value: 'new',         label: 'Новые' },
  { value: 'in_progress', label: 'В работе' },
  { value: 'done',        label: 'Выполнено' },
  { value: 'rejected',    label: 'Отклонено' },
]

export default function KaizenPage() {
  const [items,    setItems]    = useState<KaizenItem[]>([])
  const [depts,    setDepts]    = useState<Department[]>([])
  const [domains,  setDomains]  = useState<Domain[]>([])
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filterDept,   setFilterDept]   = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [search,       setSearch]       = useState('')

  const load = useCallback(() => {
    setLoading(true)
    const params: any = {}
    if (filterDept)   params.dept_id = filterDept
    if (filterStatus) params.status  = filterStatus
    getKaizen(params).then(setItems).finally(() => setLoading(false))
  }, [filterDept, filterStatus])

  useEffect(() => {
    getDepartments().then(setDepts)
    api.get<Domain[]>('/domains').then(r => setDomains(r.data)).catch(() => {})
    // fallback: fetch domains from master
    import('@/api').then(({ getMaster }) =>
      getMaster().then(d => setDomains(d.domains)).catch(() => {})
    )
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = items.filter(i =>
    !search || i.title.toLowerCase().includes(search.toLowerCase()) ||
    (i.description ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const counts = {
    new:         items.filter(i => i.status === 'new').length,
    in_progress: items.filter(i => i.status === 'in_progress').length,
    done:        items.filter(i => i.status === 'done').length,
    rejected:    items.filter(i => i.status === 'rejected').length,
  }

  return (
    <div className="pt-20 px-4 max-w-screen-xl mx-auto pb-12">
      <div className="flex flex-wrap items-start justify-between gap-4 py-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Кайдзен-предложения</h1>
          <p className="text-gray-400 text-sm mt-1">Непрерывное совершенствование процессов</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Новое предложение
        </button>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Новые',      value: counts.new,         cls: 'text-blue-400' },
          { label: 'В работе',   value: counts.in_progress, cls: 'text-yellow-400' },
          { label: 'Выполнено',  value: counts.done,        cls: 'text-green-400' },
          { label: 'Отклонено',  value: counts.rejected,    cls: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className={`text-2xl font-bold ${s.cls}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Фильтры */}
      <div className="flex flex-wrap gap-2 mb-6">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Поиск…"
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 w-48"
        />
        <select
          value={filterDept}
          onChange={e => setFilterDept(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
        >
          <option value="">Все отделы</option>
          {depts.map(d => <option key={d.id} value={d.id}>{d.name_short}</option>)}
        </select>
        <div className="flex gap-1">
          {STATUSES.map(s => (
            <button
              key={s.value}
              onClick={() => setFilterStatus(s.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterStatus === s.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Список */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <Skeleton lines={3} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <div className="text-4xl mb-3">💡</div>
          <div>Предложений пока нет</div>
          <button onClick={() => setShowForm(true)} className="mt-4 text-blue-400 hover:text-blue-300 text-sm underline">
            Добавить первое
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => (
            <KaizenCard key={item.id} item={item} onUpdated={load} />
          ))}
        </div>
      )}

      {/* Форма создания */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Новое кайдзен-предложение">
        <KaizenForm
          departments={depts}
          domains={domains}
          onCreated={() => { setShowForm(false); load() }}
          onCancel={() => setShowForm(false)}
        />
      </Modal>
    </div>
  )
}
