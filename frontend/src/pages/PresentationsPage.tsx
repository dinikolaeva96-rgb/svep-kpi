import { useEffect, useState } from 'react'
import {
  getPresentations, createPresentation, updatePresentation, deletePresentation,
  type Presentation,
} from '@/api'
import { useAuthStore } from '@/store/auth'

const STATUS_LABEL: Record<string, string> = {
  planned:     'Запланирован',
  in_progress: 'В работе',
  done:        'Готов',
}

const STATUS_COLOR: Record<string, string> = {
  planned:     '#6B8AA8',
  in_progress: '#F2994A',
  done:        '#1D9E75',
}

const EMPTY: Omit<Presentation, 'id' | 'created_at' | 'updated_at'> = {
  author_name: '',
  topic: '',
  deadline: null,
  status: 'planned',
  sort_order: 0,
}

export default function PresentationsPage() {
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'admin' || user?.role === 'management'

  const [rows, setRows]       = useState<Presentation[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Presentation | null>(null)
  const [adding, setAdding]   = useState(false)
  const [form, setForm]       = useState({ ...EMPTY })
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  async function load() {
    setLoading(true)
    try { setRows(await getPresentations()) } catch { setError('Ошибка загрузки') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  function startAdd() {
    setForm({ ...EMPTY, sort_order: rows.length + 1 })
    setAdding(true)
    setEditing(null)
  }

  function startEdit(p: Presentation) {
    setForm({ author_name: p.author_name, topic: p.topic, deadline: p.deadline,
               status: p.status, sort_order: p.sort_order })
    setEditing(p)
    setAdding(false)
  }

  function cancel() { setAdding(false); setEditing(null); setError('') }

  async function save() {
    if (!form.author_name.trim() || !form.topic.trim()) {
      setError('Заполните автора и тему'); return
    }
    setSaving(true); setError('')
    try {
      if (adding) {
        await createPresentation(form)
      } else if (editing) {
        await updatePresentation(editing.id, form)
      }
      await load()
      cancel()
    } catch { setError('Ошибка сохранения') }
    finally { setSaving(false) }
  }

  async function remove(id: number) {
    if (!confirm('Удалить доклад?')) return
    try { await deletePresentation(id); setRows(r => r.filter(x => x.id !== id)) }
    catch { setError('Ошибка удаления') }
  }

  const grouped: Record<string, Presentation[]> = {}
  for (const p of rows) {
    if (!grouped[p.author_name]) grouped[p.author_name] = []
    grouped[p.author_name].push(p)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F0F5FB', padding: '32px 40px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontFamily: "'Exo 2', sans-serif",
              fontWeight: 700, color: '#0D1B2A', letterSpacing: '-0.01em' }}>
              План докладов
            </h1>
            <p style={{ margin: '6px 0 0', fontSize: 14, color: '#6B8AA8' }}>
              {rows.length} докладов · {rows.filter(r => r.status === 'done').length} готово
            </p>
          </div>
          {isAdmin && (
            <button onClick={startAdd} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 10,
              background: '#2196C9', color: '#fff', border: 'none',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}>
              + Добавить
            </button>
          )}
        </div>

        {/* Add/Edit form */}
        {(adding || editing) && (
          <div style={{
            background: '#fff', borderRadius: 16, padding: 28,
            border: '1px solid rgba(28,132,198,0.15)',
            boxShadow: '0 4px 24px rgba(28,132,198,0.08)',
            marginBottom: 28,
          }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600, color: '#0D1B2A' }}>
              {adding ? 'Новый доклад' : 'Редактировать доклад'}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600,
                  color: '#6B8AA8', marginBottom: 6, letterSpacing: '0.04em' }}>
                  АВТОР
                </label>
                <input
                  value={form.author_name}
                  onChange={e => setForm(f => ({ ...f, author_name: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, boxSizing: 'border-box',
                    border: '1px solid rgba(28,132,198,0.2)', fontSize: 14, outline: 'none', color: '#0D1B2A' }}
                  placeholder="Фамилия И.О."
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600,
                  color: '#6B8AA8', marginBottom: 6, letterSpacing: '0.04em' }}>
                  ДЕДЛАЙН
                </label>
                <input
                  type="date"
                  value={form.deadline ?? ''}
                  onChange={e => setForm(f => ({ ...f, deadline: e.target.value || null }))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, boxSizing: 'border-box',
                    border: '1px solid rgba(28,132,198,0.2)', fontSize: 14, outline: 'none', color: '#0D1B2A' }}
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600,
                  color: '#6B8AA8', marginBottom: 6, letterSpacing: '0.04em' }}>
                  ТЕМА
                </label>
                <input
                  value={form.topic}
                  onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, boxSizing: 'border-box',
                    border: '1px solid rgba(28,132,198,0.2)', fontSize: 14, outline: 'none', color: '#0D1B2A' }}
                  placeholder="Тема доклада"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600,
                  color: '#6B8AA8', marginBottom: 6, letterSpacing: '0.04em' }}>
                  СТАТУС
                </label>
                <select
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value as Presentation['status'] }))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, boxSizing: 'border-box',
                    border: '1px solid rgba(28,132,198,0.2)', fontSize: 14, outline: 'none',
                    color: '#0D1B2A', background: '#fff' }}
                >
                  <option value="planned">Запланирован</option>
                  <option value="in_progress">В работе</option>
                  <option value="done">Готов</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600,
                  color: '#6B8AA8', marginBottom: 6, letterSpacing: '0.04em' }}>
                  ПОРЯДОК
                </label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, boxSizing: 'border-box',
                    border: '1px solid rgba(28,132,198,0.2)', fontSize: 14, outline: 'none', color: '#0D1B2A' }}
                />
              </div>
            </div>
            {error && <p style={{ color: '#EB5757', fontSize: 13, marginTop: 12 }}>{error}</p>}
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={save} disabled={saving} style={{
                padding: '10px 24px', borderRadius: 8, background: '#2196C9',
                color: '#fff', border: 'none', fontSize: 14, fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1,
              }}>
                {saving ? 'Сохранение…' : 'Сохранить'}
              </button>
              <button onClick={cancel} style={{
                padding: '10px 24px', borderRadius: 8, background: 'transparent',
                color: '#6B8AA8', border: '1px solid rgba(28,132,198,0.2)',
                fontSize: 14, cursor: 'pointer',
              }}>
                Отмена
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#6B8AA8' }}>Загрузка…</div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(28,132,198,0.1)',
            overflow: 'hidden', boxShadow: '0 2px 16px rgba(28,132,198,0.06)' }}>

            {/* Table header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '40px 1fr 2fr 120px 110px',
              gap: 0, padding: '10px 20px',
              background: 'rgba(28,132,198,0.04)',
              borderBottom: '1px solid rgba(28,132,198,0.08)',
            }}>
              {['№', 'Автор', 'Тема', 'Дедлайн', 'Статус'].map(h => (
                <span key={h} style={{ fontSize: 11, fontWeight: 600,
                  color: '#A0B4C8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {h}
                </span>
              ))}
            </div>

            {rows.map((p, i) => (
              <div
                key={p.id}
                style={{
                  display: 'grid', gridTemplateColumns: '40px 1fr 2fr 120px 110px',
                  gap: 0, padding: '14px 20px', alignItems: 'center',
                  borderBottom: i < rows.length - 1 ? '1px solid rgba(28,132,198,0.06)' : 'none',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(28,132,198,0.025)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ fontSize: 12, color: '#C0D0E0', fontFamily: "'JetBrains Mono', monospace" }}>
                  {String(p.sort_order || i + 1).padStart(2, '0')}
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#0D1B2A' }}>
                  {p.author_name}
                </span>
                <span style={{ fontSize: 14, color: '#4A6580', lineHeight: 1.4 }}>
                  {p.topic}
                </span>
                <span style={{ fontSize: 13, color: p.deadline ? '#4A6580' : '#C0D0E0' }}>
                  {p.deadline
                    ? new Date(p.deadline).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
                    : '—'}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6,
                    background: `${STATUS_COLOR[p.status]}18`,
                    color: STATUS_COLOR[p.status],
                  }}>
                    {STATUS_LABEL[p.status]}
                  </span>
                  {isAdmin && (
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => startEdit(p)} style={{
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        color: '#A0B4C8', padding: '2px 4px', fontSize: 13,
                      }} title="Редактировать">✎</button>
                      <button onClick={() => remove(p.id)} style={{
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        color: '#EB5757', padding: '2px 4px', fontSize: 13,
                      }} title="Удалить">✕</button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {rows.length === 0 && (
              <div style={{ padding: 48, textAlign: 'center', color: '#A0B4C8' }}>
                Доклады не добавлены
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
