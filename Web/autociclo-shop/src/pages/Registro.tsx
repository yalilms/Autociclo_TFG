import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, Phone, AlertCircle } from 'lucide-react'
import client from '../api/client'
import { useAuthStore } from '../store/authStore'

export default function Registro() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [form, setForm] = useState({ nombre: '', email: '', password: '', telefono: '' })
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
    { key: 'nombre'   as const, label: 'Nombre completo', type: 'text',     placeholder: 'Juan García',    icon: <User  className="w-3.5 h-3.5" />, auto: 'name' },
    { key: 'email'    as const, label: 'Email',           type: 'email',    placeholder: 'tu@email.com',   icon: <Mail  className="w-3.5 h-3.5" />, auto: 'email' },
    { key: 'password' as const, label: 'Contraseña',      type: 'password', placeholder: 'Mínimo 8 chars', icon: <Lock  className="w-3.5 h-3.5" />, auto: 'new-password' },
    { key: 'telefono' as const, label: 'Teléfono (opt.)', type: 'tel',      placeholder: '600 123 456',    icon: <Phone className="w-3.5 h-3.5" />, auto: 'tel' },
  ]

  return (
    <div className="h-full flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <p className="text-label-caps mb-1">AUTOCICLO · DESGUACE PROFESIONAL</p>
          <h1 className="text-h2">Crear cuenta</h1>
        </div>

        <div className="card overflow-hidden">
          <div className="card-header">
            <span className="card-title">Registro de cliente</span>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="flex items-center gap-2 px-3 py-2 rounded bg-red-50 border border-red-200 text-red-700 text-[12px]">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              {campos.map(f => (
                <div key={f.key}>
                  <label className="text-label-caps block mb-1.5">{f.label}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">{f.icon}</span>
                    <input
                      type={f.type}
                      value={form[f.key]}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      autoComplete={f.auto}
                      className="w-full pl-9 pr-3 py-2 text-[13px] bg-surface-dim border border-outline-variant rounded outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              ))}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-primary text-white text-[12px] font-bold rounded hover:bg-blue-600 transition-colors uppercase tracking-widest disabled:opacity-50 mt-1"
              >
                {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
              </button>
            </form>

            <p className="text-center text-body-sm mt-5">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline">Iniciar sesión</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
