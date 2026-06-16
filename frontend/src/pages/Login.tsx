import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as apiLogin } from '@/api'
import { useAuthStore } from '@/store/auth'
import GeometricMotif from '@/components/GeometricMotif'

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
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden" style={{ background: 'var(--navy)' }}>
      <GeometricMotif variant="watermark" className="text-white opacity-[0.04] !absolute top-0 right-0" />

      <div className="relative w-full max-w-[400px]">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-5">
            <GeometricMotif variant="header" className="text-white w-16 h-16" />
          </div>
          <h1 className="font-brutal font-extrabold text-3xl tracking-[-0.01em] text-white">
            Вход в систему
          </h1>
          <p className="eyebrow mt-3 text-white/65" style={{ textTransform: 'none', letterSpacing: 0 }}>
            ООО Средневолжскэлектропроект
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          style={{ background: 'var(--navy-surface)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 48 }}
        >
          {error && (
            <div className="bg-red-500/10 border border-red-400/30 text-red-300 text-sm rounded-lg px-4 py-2">
              {error}
            </div>
          )}
          <div>
            <label className="block eyebrow mb-2 text-white/65" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 12 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input-navy w-full"
              placeholder="admin@svep.ru"
              required
            />
          </div>
          <div>
            <label className="block eyebrow mb-2 text-white/65" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 12 }}>
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input-navy w-full"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg font-medium text-sm text-white disabled:opacity-50 transition-colors"
            style={{ backgroundColor: 'var(--accent)' }}
            onMouseOver={e => !loading && (e.currentTarget.style.backgroundColor = 'var(--accent-hover)')}
            onMouseOut={e => (e.currentTarget.style.backgroundColor = 'var(--accent)')}
          >
            {loading ? 'Вход…' : 'Войти'}
          </button>
        </form>

        <div className="mt-4 text-center space-y-1">
          <p className="eyebrow text-white/40" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 11 }}>Демо-учётные данные:</p>
          <p className="mono-num text-xs text-white/65">admin@svep.ru / Admin123!</p>
          <p className="mono-num text-xs text-white/40">director@svep.ru / Director1!</p>
        </div>
      </div>
    </div>
  )
}
