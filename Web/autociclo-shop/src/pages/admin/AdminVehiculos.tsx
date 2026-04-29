import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, AlertCircle, Car } from 'lucide-react'
import { cn } from '../../lib/utils'
import { motion, AnimatePresence } from 'motion/react'
import client from '../../api/client'
import type { Vehiculo } from '../../types'

const ESTADOS = ['EN_PROCESO', 'DISPONIBLE', 'VENDIDO', 'BAJA']

const EMPTY = {
  matricula: '', marca: '', modelo: '', anio: new Date().getFullYear().toString(),
  color: '', estado: 'EN_PROCESO', precioCompra: '', kilometraje: '',
  ubicacionGps: '', observaciones: '', fechaEntrada: new Date().toISOString().split('T')[0],
}

type FormData = typeof EMPTY

const ESTADO_CLS: Record<string, string> = {
  EN_PROCESO: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  DISPONIBLE: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  VENDIDO:    'bg-blue-500/10 border-blue-500/20 text-blue-400',
  BAJA:       'bg-red-500/10 border-red-500/20 text-red-400',
}

export default function AdminVehiculos() {
  const [vehiculos, setVehiculos]   = useState<Vehiculo[]>([])
  const [loading, setLoading]       = useState(true)
  const [modal, setModal]           = useState(false)
  const [editing, setEditing]       = useState<Vehiculo | null>(null)
  const [form, setForm]             = useState<FormData>(EMPTY)
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState('')
  const [toast, setToast]           = useState('')
  const [confirmDel, setConfirmDel] = useState<Vehiculo | null>(null)

  const load = () => {
    setLoading(true)
    client.get('/vehiculos').then(r => setVehiculos(r.data)).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY)
    setError('')
    setModal(true)
  }

  const openEdit = (v: Vehiculo) => {
    setEditing(v)
    setForm({
      matricula: v.matricula,
      marca: v.marca,
      modelo: v.modelo,
      anio: String(v.anio),
      color: v.color ?? '',
      estado: v.estado,
      precioCompra: String(v.precioCompra ?? ''),
      kilometraje: String(v.kilometraje ?? ''),
      ubicacionGps: v.ubicacionGps ?? '',
      observaciones: v.observaciones ?? '',
      fechaEntrada: v.fechaEntrada ?? new Date().toISOString().split('T')[0],
    })
    setError('')
    setModal(true)
  }

  const handleSave = async () => {
    setError('')
    if (!form.matricula || !form.marca || !form.modelo || !form.precioCompra) {
      setError('Matrícula, marca, modelo y precio son obligatorios.')
      return
    }
    setSaving(true)
    try {
      const body = {
        ...form,
        anio: parseInt(form.anio),
        precioCompra: parseFloat(form.precioCompra),
        kilometraje: form.kilometraje ? parseInt(form.kilometraje) : null,
      }
      if (editing) {
        await client.put(`/vehiculos/${editing.id}`, body)
        showToast('Vehículo actualizado.')
      } else {
        await client.post('/vehiculos', body)
        showToast('Vehículo creado.')
      }
      setModal(false)
      load()
    } catch { setError('Error al guardar. Comprueba los datos.') }
    finally { setSaving(false) }
  }

  const handleDelete = async (v: Vehiculo) => {
    try {
      await client.delete(`/vehiculos/${v.id}`)
      showToast('Vehículo eliminado.')
      setConfirmDel(null)
      load()
    } catch { showToast('Error al eliminar.') }
  }

  const field = (key: keyof FormData) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(p => ({ ...p, [key]: e.target.value })),
  })

  const inputCls = "w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">Vehículos</h1>
          <p className="text-slate-400">{vehiculos.length} vehículos en el patio</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nuevo vehículo
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="glass-card h-16 animate-pulse" />)}</div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                {['Matrícula', 'Marca / Modelo', 'Año', 'Estado', 'Km', 'Precio compra', ''].map(h => (
                  <th key={h} className="px-5 py-4 text-xs text-slate-500 uppercase tracking-widest font-black">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vehiculos.map((v, i) => (
                <motion.tr key={v.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-5 py-4 font-mono text-white font-bold">{v.matricula}</td>
                  <td className="px-5 py-4 text-white">{v.marca} {v.modelo}</td>
                  <td className="px-5 py-4 text-slate-400">{v.anio}</td>
                  <td className="px-5 py-4">
                    <span className={cn('px-2 py-0.5 rounded-md border text-xs font-bold uppercase', ESTADO_CLS[v.estado] ?? ESTADO_CLS.BAJA)}>
                      {v.estado.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-400">{v.kilometraje ? `${v.kilometraje.toLocaleString('es-ES')} km` : '—'}</td>
                  <td className="px-5 py-4 text-white font-mono">{v.precioCompra ? `${v.precioCompra.toLocaleString('es-ES')} €` : '—'}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(v)} className="p-2 rounded-lg hover:bg-blue-500/10 text-slate-500 hover:text-blue-400 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setConfirmDel(v)} className="p-2 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
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
              className="glass-card p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-white">{editing ? 'Editar vehículo' : 'Nuevo vehículo'}</h2>
                <button onClick={() => setModal(false)} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
                  <AlertCircle className="w-4 h-4 shrink-0" />{error}
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-black tracking-widest mb-2 block">Matrícula *</label>
                    <input {...field('matricula')} placeholder="1234 ABC" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-black tracking-widest mb-2 block">Estado</label>
                    <select {...field('estado')} className={inputCls}>
                      {ESTADOS.map(e => <option key={e} value={e}>{e.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-black tracking-widest mb-2 block">Marca *</label>
                    <input {...field('marca')} placeholder="Volkswagen" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-black tracking-widest mb-2 block">Modelo *</label>
                    <input {...field('modelo')} placeholder="Golf" className={inputCls} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-black tracking-widest mb-2 block">Año *</label>
                    <input type="number" min="1980" max="2030" {...field('anio')} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-black tracking-widest mb-2 block">Color</label>
                    <input {...field('color')} placeholder="Blanco" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-black tracking-widest mb-2 block">Km</label>
                    <input type="number" min="0" {...field('kilometraje')} placeholder="85000" className={inputCls} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-black tracking-widest mb-2 block">Precio compra (€) *</label>
                    <input type="number" min="0" step="0.01" {...field('precioCompra')} placeholder="500.00" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-black tracking-widest mb-2 block">Fecha entrada</label>
                    <input type="date" {...field('fechaEntrada')} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase font-black tracking-widest mb-2 block">Ubicación en patio</label>
                  <input {...field('ubicacionGps')} placeholder="Fila 3, plaza 12" className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase font-black tracking-widest mb-2 block">Observaciones</label>
                  <textarea rows={2} {...field('observaciones')} placeholder="Motor gripado, carrocería ok..." className={cn(inputCls, 'resize-none')} />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setModal(false)} className="flex-1 h-12 rounded-xl glass border border-white/10 text-slate-400 hover:text-white transition-colors font-bold">
                  Cancelar
                </button>
                <button onClick={handleSave} disabled={saving} className="flex-1 h-12 rounded-xl btn-primary font-bold disabled:opacity-40">
                  {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear vehículo'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm delete */}
      <AnimatePresence>
        {confirmDel && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="glass-card p-8 w-full max-w-sm border-white/20 text-center">
              <Car className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-black text-white mb-2">¿Eliminar vehículo?</h2>
              <p className="text-slate-400 text-sm mb-6">{confirmDel.marca} {confirmDel.modelo} — {confirmDel.matricula}</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDel(null)} className="flex-1 h-12 rounded-xl glass border border-white/10 text-slate-400 hover:text-white font-bold">Cancelar</button>
                <button onClick={() => handleDelete(confirmDel)} className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold">Eliminar</button>
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
