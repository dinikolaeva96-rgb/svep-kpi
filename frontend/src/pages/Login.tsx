import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as apiLogin } from '@/api'
import { useAuthStore } from '@/store/auth'
import LogoMark from '@/assets/logo-mark.svg?react'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { setTokens } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await apiLogin(email, password)
      setTokens(data.accessToken, data.refreshToken)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Ошибка входа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-svep-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-5">
            <LogoMark style={{ width: 64, height: 64, color: 'var(--accent)' }} />
          </div>
          <h1 className="font-brutal font-black text-3xl tracking-[-0.01em] text-svep-primary">
            Экосистема <span style={{ color: 'var(--accent)' }}>СВЭП</span>
          </h1>
          <p className="eyebrow mt-3">ООО Средневолжскэлектропроект</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-svep-surface border border-svep-border rounded-2xl p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">
              {error}
            </div>
          )}
          <div>
            <label className="block eyebrow mb-2" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 12, color: 'var(--text-secondary)' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input-light w-full"
              placeholder="admin@svep.ru"
              required
            />
          </div>
          <div>
            <label className="block eyebrow mb-2" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 12, color: 'var(--text-secondary)' }}>
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input-light w-full"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg font-medium text-sm text-white disabled:opacity-50 transition-colors"
            style={{ backgroundColor: 'var(--accent)' }}
            onMouseOver={e => !loading && (e.currentTarget.style.backgroundColor = 'var(--accent-dark)')}
            onMouseOut={e => (e.currentTarget.style.backgroundColor = 'var(--accent)')}
          >
            {loading ? 'Вход…' : 'Войти'}
          </button>
        </form>

        <div className="mt-4 text-center space-y-1">
          <p className="eyebrow" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 11 }}>Демо-учётные данные:</p>
          <p className="mono-num text-xs text-svep-secondary">admin@svep.ru / Admin123!</p>
          <p className="mono-num text-xs text-svep-tertiary">director@svep.ru / Director1!</p>
        </div>
      </div>
    </div>
  )
}
