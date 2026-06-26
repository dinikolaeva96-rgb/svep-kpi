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
    <div className="bg-svep-bg min-h-full">
      <div className="max-w-screen-xl mx-auto px-4 pb-12">
        <div className="flex flex-wrap items-start justify-between gap-4 py-6">
          <div>
            <h1 className="text-2xl font-bold text-svep-primary">Кайдзен-предложения</h1>
            <p className="text-svep-secondary text-sm mt-1">Непрерывное совершенствование процессов</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            + Новое предложение
          </button>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Новые',      value: counts.new,         cls: 'text-svep-accent' },
            { label: 'В работе',   value: counts.in_progress, cls: 'text-amber-600' },
            { label: 'Выполнено',  value: counts.done,        cls: 'text-green-600' },
            { label: 'Отклонено',  value: counts.rejected,    cls: 'text-red-600' },
          ].map(s => (
            <div key={s.label} className="bg-svep-surface border border-svep-border rounded-xl p-4 text-center">
              <div className={`text-2xl font-bold ${s.cls}`}>{s.value}</div>
              <div className="text-xs text-svep-tertiary mt-1">{s.label}</div>
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
            className="input-light w-48"
          />
          <select
            value={filterDept}
            onChange={e => setFilterDept(e.target.value)}
            className="input-light"
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
                    ? 'bg-svep-accent text-white'
                    : 'bg-gray-100 text-svep-secondary hover:text-svep-primary border border-svep-border'
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
              <div key={i} className="bg-svep-surface border border-svep-border rounded-xl p-5">
                <Skeleton lines={3} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-svep-tertiary">
            <div className="text-4xl mb-3">💡</div>
            <div>Предложений пока нет</div>
            <button onClick={() => setShowForm(true)} className="mt-4 text-svep-accent hover:underline text-sm">
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
    </div>
  )
}
