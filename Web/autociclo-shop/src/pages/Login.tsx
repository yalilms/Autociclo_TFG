import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, LogIn, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import client from '../api/client'
import { useAuthStore } from '../store/authStore'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string })?.from || '/'
  const { login } = useAuthStore()
  const [form, setForm]   = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.email.trim()) { setError('Introduce tu email.'); return }
    if (!form.email.includes('@')) { setError('Introduce un email válido (ej: nombre@autociclo.es).'); return }
    if (!form.password) { setError('Introduce tu contraseña.'); return }
    setLoading(true)
    try {
      const res = await client.post('/auth/login', form)
      const { token, nombre, email, rol } = res.data
      login(token, { id: 0, nombre, email, rol })
      navigate(from, { replace: true })
    } catch (err: unknown) {
      const ae = err as { response?: { status?: number } }
      if (ae.response?.status === 401) {
        setError('Email o contraseña incorrectos. Comprueba tus datos.')
      } else if (ae.response?.status === 403) {
        setError('Cuenta sin acceso. Contacta con el administrador.')
      } else {
        setError('No se pudo conectar con el servidor. Inténtalo de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden bg-bg-deep">
      {/* Glow de fondo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <button
        onClick={() => navigate(-1)}
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-white transition-colors group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span>Volver</span>
      </button>

      <div className="max-w-md w-full glass-card p-10 border-white/20 relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <img src="/logo.png" alt="AutoCiclo" className="w-16 h-16 object-cover rounded-full mx-auto mb-4" />
          <h1 className="text-4xl font-black text-white mb-2">Bienvenido</h1>
          <p className="text-slate-500">Inicia sesión en tu cuenta de AutoCiclo</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs text-slate-500 uppercase font-black tracking-widest">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value.trim() }))}
                placeholder="admin@autociclo.es"
                autoComplete="email"
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 pl-12 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-slate-500 uppercase font-black tracking-widest">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 pl-12 pr-12 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
              >
                {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full h-14 flex items-center justify-center gap-3 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <LogIn className="w-6 h-6" />
            )}
            {loading ? 'Accediendo...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-600">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" state={{ from }} className="text-blue-500 font-bold hover:underline">Regístrate gratis</Link>
        </p>
      </div>
    </div>
  )
}
