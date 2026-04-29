import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, Phone, AlertCircle, ArrowLeft, UserPlus } from 'lucide-react'
import client from '../api/client'
import { useAuthStore } from '../store/authStore'

export default function Registro() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [form, setForm]   = useState({ nombre: '', email: '', password: '', telefono: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.nombre || !form.email || !form.password) { setError('Nombre, email y contraseña son obligatorios.'); return }
    if (form.password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return }
    setLoading(true)
    try {
      const res = await client.post('/auth/register', { ...form, rol: 'CLIENTE' })
      const { token, nombre, email, rol, id } = res.data
      login(token, { id, nombre, email, rol })
      navigate('/')
    } catch (err: unknown) {
      const ae = err as { response?: { data?: { message?: string } } }
      setError(ae.response?.data?.message || 'El email ya está en uso o ha ocurrido un error.')
    } finally {
      setLoading(false)
    }
  }

  const campos = [
    { key: 'nombre'   as const, label: 'Nombre completo', type: 'text',     placeholder: 'Juan García',    Icon: User,  auto: 'name' },
    { key: 'email'    as const, label: 'Email',           type: 'email',    placeholder: 'tu@email.com',   Icon: Mail,  auto: 'email' },
    { key: 'password' as const, label: 'Contraseña',      type: 'password', placeholder: 'Mínimo 8 chars', Icon: Lock,  auto: 'new-password' },
    { key: 'telefono' as const, label: 'Teléfono (opt.)', type: 'tel',      placeholder: '600 123 456',    Icon: Phone, auto: 'tel' },
  ]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden bg-bg-deep">
      {/* Glow de fondo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

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
          <img src="/logo.png" alt="AutoCiclo" className="w-16 h-16 object-contain mx-auto mb-4" />
          <h1 className="text-4xl font-black text-white mb-2">Crear cuenta</h1>
          <p className="text-slate-500">Únete a AutoCiclo y solicita presupuestos al instante</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {campos.map(({ key, label, type, placeholder, Icon, auto }) => (
            <div key={key} className="space-y-2">
              <label className="text-xs text-slate-500 uppercase font-black tracking-widest">{label}</label>
              <div className="relative">
                <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type={type}
                  value={form[key]}
                  onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder}
                  autoComplete={auto}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 pl-12 text-white focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all"
                />
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 flex items-center justify-center gap-3 text-lg font-bold rounded-xl bg-violet-600 hover:bg-violet-500 text-white transition-all active:scale-95 glow-violet disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <UserPlus className="w-6 h-6" />
            )}
            {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-600">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-blue-500 font-bold hover:underline">Iniciar sesión</Link>
        </p>
      </div>
    </div>
  )
}
