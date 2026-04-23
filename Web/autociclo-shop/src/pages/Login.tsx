import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, AlertCircle } from 'lucide-react'
import client from '../api/client'
import { useAuthStore } from '../store/authStore'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) { setError('Completa todos los campos.'); return }
    setLoading(true)
    try {
      const res = await client.post('/auth/login', form)
      const { token, nombre, email, rol, id } = res.data
      login(token, { id, nombre, email, rol })
      navigate('/')
    } catch (err: unknown) {
      const ae = err as { response?: { status?: number } }
      setError(ae.response?.status === 401 ? 'Email o contraseña incorrectos.' : 'Error al conectar con el servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <p className="text-label-caps mb-1">AUTOCICLO · DESGUACE PROFESIONAL</p>
          <h1 className="text-h2">Iniciar sesión</h1>
        </div>

        <div className="card overflow-hidden">
          <div className="card-header">
            <span className="card-title">Acceso de cliente</span>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="flex items-center gap-2 px-3 py-2 rounded bg-red-50 border border-red-200 text-red-700 text-[12px]">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <div>
                <label className="text-label-caps block mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface-variant" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="tu@email.com"
                    autoComplete="email"
                    className="w-full pl-9 pr-3 py-2 text-[13px] bg-surface-dim border border-outline-variant rounded outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-label-caps block mb-1.5">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface-variant" />
                  <input
                    type="password"
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full pl-9 pr-3 py-2 text-[13px] bg-surface-dim border border-outline-variant rounded outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-primary text-white text-[12px] font-bold rounded hover:bg-blue-600 transition-colors uppercase tracking-widest disabled:opacity-50 mt-1"
              >
                {loading ? 'Accediendo...' : 'Iniciar sesión'}
              </button>
            </form>

            <p className="text-center text-body-sm mt-5">
              ¿Sin cuenta?{' '}
              <Link to="/registro" className="text-primary font-bold hover:underline">Regístrate gratis</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
