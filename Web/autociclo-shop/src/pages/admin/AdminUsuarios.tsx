import { useState, useEffect } from 'react'
import { Plus, Pencil, UserX, X, AlertCircle, ShieldCheck, User, Wrench } from 'lucide-react'
import { cn } from '../../lib/utils'
import { motion, AnimatePresence } from 'motion/react'
import client from '../../api/client'
import type { UsuarioAdmin } from '../../types'

const ROLES = ['ADMIN', 'EMPLEADO', 'CLIENTE']

const ROL_CFG: Record<string, { cls: string; Icon: React.ElementType }> = {
  ADMIN:    { cls: 'bg-violet-500/10 border-violet-500/20 text-violet-400', Icon: ShieldCheck },
  EMPLEADO: { cls: 'bg-blue-500/10 border-blue-500/20 text-blue-400',       Icon: Wrench },
  CLIENTE:  { cls: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400', Icon: User },
}

const EMPTY = { nombre: '', email: '', password: '', rolNombre: 'CLIENTE', activo: 'true' }
type FormData = typeof EMPTY

export default function AdminUsuarios() {
  const [usuarios, setUsuarios]     = useState<UsuarioAdmin[]>([])
  const [loading, setLoading]       = useState(true)
  const [modal, setModal]           = useState(false)
  const [editing, setEditing]       = useState<UsuarioAdmin | null>(null)
  const [form, setForm]             = useState<FormData>(EMPTY)
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState('')
  const [toast, setToast]           = useState('')
  const [confirmDes, setConfirmDes] = useState<UsuarioAdmin | null>(null)

  const load = () => {
    setLoading(true)
    client.get('/usuarios').then(r => setUsuarios(r.data)).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY)
    setError('')
    setModal(true)
  }

  const openEdit = (u: UsuarioAdmin) => {
    setEditing(u)
    setForm({ nombre: u.nombre, email: u.email, password: '', rolNombre: u.rol, activo: String(u.activo) })
    setError('')
    setModal(true)
  }

  const handleSave = async () => {
    setError('')
    if (!form.nombre || !form.email) { setError('Nombre y email son obligatorios.'); return }
    if (!editing && !form.password) { setError('La contraseña es obligatoria para nuevos usuarios.'); return }
    if (form.password && form.password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return }
    setSaving(true)
    try {
      const body: Record<string, unknown> = { nombre: form.nombre, email: form.email, rolNombre: form.rolNombre, activo: form.activo === 'true' }
      if (form.password) body.password = form.password
      if (editing) {
        await client.put(`/usuarios/${editing.idUsuario}`, body)
        showToast('Usuario actualizado.')
      } else {
        await client.post('/usuarios', body)
        showToast('Usuario creado.')
      }
      setModal(false)
      load()
    } catch (e: unknown) {
      const ae = e as { response?: { data?: { message?: string } } }
      setError(ae.response?.data?.message || 'Error al guardar.')
    } finally { setSaving(false) }
  }

  const handleDeactivate = async (u: UsuarioAdmin) => {
    try {
      await client.delete(`/usuarios/${u.idUsuario}`)
      showToast('Usuario desactivado.')
      setConfirmDes(null)
      load()
    } catch { showToast('Error al desactivar.') }
  }

  const field = (key: keyof FormData) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(p => ({ ...p, [key]: e.target.value })),
  })

  const inputCls = "w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"

  const fmt = (d?: string) => d ? new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">Usuarios</h1>
          <p className="text-slate-400">{usuarios.length} usuarios registrados</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nuevo usuario
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="glass-card h-16 animate-pulse" />)}</div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                {['Nombre', 'Email', 'Rol', 'Estado', 'Alta', ''].map(h => (
                  <th key={h} className="px-5 py-4 text-xs text-slate-500 uppercase tracking-widest font-black">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u, i) => {
                const cfg = ROL_CFG[u.rol] ?? ROL_CFG.CLIENTE
                return (
                  <motion.tr key={u.idUsuario} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="px-5 py-4 text-white font-medium">{u.nombre}</td>
                    <td className="px-5 py-4 text-slate-400">{u.email}</td>
                    <td className="px-5 py-4">
                      <span className={cn('flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-lg border text-xs font-bold', cfg.cls)}>
                        <cfg.Icon className="w-3 h-3" />{u.rol}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn('px-2 py-0.5 rounded-md border text-xs font-bold',
                        u.activo ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-500/10 border-slate-500/20 text-slate-500')}>
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500 text-xs">{fmt(u.fechaAlta)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => openEdit(u)} className="p-2 rounded-lg hover:bg-blue-500/10 text-slate-500 hover:text-blue-400 transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        {u.activo && (
                          <button onClick={() => setConfirmDes(u)} className="p-2 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors" title="Desactivar">
                            <UserX className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) setModal(false) }}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="glass-card p-8 w-full max-w-md border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-white">{editing ? 'Editar usuario' : 'Nuevo usuario'}</h2>
                <button onClick={() => setModal(false)} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
                  <AlertCircle className="w-4 h-4 shrink-0" />{error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-500 uppercase font-black tracking-widest mb-2 block">Nombre completo *</label>
                  <input {...field('nombre')} placeholder="Juan García" className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase font-black tracking-widest mb-2 block">Email *</label>
                  <input type="email" {...field('email')} placeholder="juan@email.com" className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase font-black tracking-widest mb-2 block">
                    Contraseña {editing ? '(dejar en blanco para no cambiar)' : '*'}
                  </label>
                  <input type="password" {...field('password')} placeholder="Mínimo 8 caracteres" autoComplete="new-password" className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-black tracking-widest mb-2 block">Rol</label>
                    <select {...field('rolNombre')} className={inputCls}>
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-black tracking-widest mb-2 block">Estado</label>
                    <select {...field('activo')} className={inputCls}>
                      <option value="true">Activo</option>
                      <option value="false">Inactivo</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setModal(false)} className="flex-1 h-12 rounded-xl glass border border-white/10 text-slate-400 hover:text-white transition-colors font-bold">
                  Cancelar
                </button>
                <button onClick={handleSave} disabled={saving} className="flex-1 h-12 rounded-xl btn-primary font-bold disabled:opacity-40">
                  {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear usuario'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm deactivate */}
      <AnimatePresence>
        {confirmDes && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="glass-card p-8 w-full max-w-sm border-white/20 text-center">
              <UserX className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <h2 className="text-xl font-black text-white mb-2">¿Desactivar usuario?</h2>
              <p className="text-slate-400 text-sm mb-6">{confirmDes.nombre} — {confirmDes.email}</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDes(null)} className="flex-1 h-12 rounded-xl glass border border-white/10 text-slate-400 hover:text-white font-bold">Cancelar</button>
                <button onClick={() => handleDeactivate(confirmDes)} className="flex-1 h-12 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold">Desactivar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 px-5 py-3 glass-card border-white/20 text-white text-sm font-bold">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
