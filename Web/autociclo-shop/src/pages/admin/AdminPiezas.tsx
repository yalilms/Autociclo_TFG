import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, AlertCircle } from 'lucide-react'
import { cn, formatPrice } from '../../lib/utils'
import { motion, AnimatePresence } from 'motion/react'
import client from '../../api/client'
import type { Pieza } from '../../types'

const CATEGORIAS = ['motor', 'carroceria', 'interior', 'electronica', 'ruedas', 'otros']

const EMPTY = { codigoPieza: '', nombre: '', categoria: 'motor', precioVenta: '', stockDisponible: '0', stockMinimo: '1', ubicacionAlmacen: '', compatibleMarcas: '', descripcion: '' }

type FormData = typeof EMPTY

export default function AdminPiezas() {
  const [piezas, setPiezas]     = useState<Pieza[]>([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(false)
  const [editing, setEditing]   = useState<Pieza | null>(null)
  const [form, setForm]         = useState<FormData>(EMPTY)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')
  const [toast, setToast]       = useState('')
  const [confirmDel, setConfirmDel] = useState<Pieza | null>(null)

  const load = () => {
    setLoading(true)
    client.get('/piezas').then(r => setPiezas(r.data)).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY)
    setError('')
    setModal(true)
  }

  const openEdit = (p: Pieza) => {
    setEditing(p)
    setForm({
      codigoPieza: p.codigoPieza,
      nombre: p.nombre,
      categoria: p.categoria,
      precioVenta: String(p.precio),
      stockDisponible: String(p.stockDisponible ?? 0),
      stockMinimo: String(p.stockMinimo ?? 1),
      ubicacionAlmacen: p.ubicacion ?? '',
      compatibleMarcas: p.compatibleMarcas ?? '',
      descripcion: p.descripcion ?? '',
    })
    setError('')
    setModal(true)
  }

  const handleSave = async () => {
    setError('')
    if (!form.codigoPieza || !form.nombre || !form.precioVenta) {
      setError('Código, nombre y precio son obligatorios.')
      return
    }
    setSaving(true)
    try {
      const body = { ...form, precioVenta: parseFloat(form.precioVenta), stockDisponible: parseInt(form.stockDisponible), stockMinimo: parseInt(form.stockMinimo) }
      if (editing) {
        await client.put(`/piezas/${editing.id}`, body)
        showToast('Pieza actualizada.')
      } else {
        await client.post('/piezas', body)
        showToast('Pieza creada.')
      }
      setModal(false)
      load()
    } catch { setError('Error al guardar. Comprueba los datos.') }
    finally { setSaving(false) }
  }

  const handleDelete = async (p: Pieza) => {
    try {
      await client.delete(`/piezas/${p.id}`)
      showToast('Pieza eliminada.')
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
          <h1 className="text-3xl font-black text-white mb-1">Piezas</h1>
          <p className="text-slate-400">{piezas.length} piezas en catálogo</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nueva pieza
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="glass-card h-16 animate-pulse" />)}</div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="px-5 py-4 text-xs text-slate-500 uppercase tracking-widest font-black">Código</th>
                <th className="px-5 py-4 text-xs text-slate-500 uppercase tracking-widest font-black">Nombre</th>
                <th className="px-5 py-4 text-xs text-slate-500 uppercase tracking-widest font-black">Categoría</th>
                <th className="px-5 py-4 text-xs text-slate-500 uppercase tracking-widest font-black">Precio</th>
                <th className="px-5 py-4 text-xs text-slate-500 uppercase tracking-widest font-black">Stock</th>
                <th className="px-5 py-4 text-xs text-slate-500 uppercase tracking-widest font-black">Ubicación</th>
                <th className="px-5 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {piezas.map((p, i) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-white/5 hover:bg-white/3 transition-colors"
                >
                  <td className="px-5 py-4 font-mono text-xs text-slate-400">{p.codigoPieza}</td>
                  <td className="px-5 py-4 text-white font-medium">{p.nombre}</td>
                  <td className="px-5 py-4">
                    <span className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs capitalize">{p.categoria}</span>
                  </td>
                  <td className="px-5 py-4 text-white font-mono">{formatPrice(p.precio)}</td>
                  <td className="px-5 py-4">
                    <span className={cn('font-bold', (p.stockDisponible ?? 0) > 0 ? 'text-emerald-400' : 'text-red-400')}>
                      {p.stockDisponible ?? 0}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-400 text-xs">{p.ubicacion || '—'}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-blue-500/10 text-slate-500 hover:text-blue-400 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setConfirmDel(p)} className="p-2 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors">
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
                <h2 className="text-xl font-black text-white">{editing ? 'Editar pieza' : 'Nueva pieza'}</h2>
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
                    <label className="text-xs text-slate-500 uppercase font-black tracking-widest mb-2 block">Código *</label>
                    <input {...field('codigoPieza')} placeholder="MOT-001" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-black tracking-widest mb-2 block">Categoría *</label>
                    <select {...field('categoria')} className={inputCls}>
                      {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase font-black tracking-widest mb-2 block">Nombre *</label>
                  <input {...field('nombre')} placeholder="Motor 1.6 TDI" className={inputCls} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-black tracking-widest mb-2 block">Precio (€) *</label>
                    <input type="number" min="0" step="0.01" {...field('precioVenta')} placeholder="0.00" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-black tracking-widest mb-2 block">Stock</label>
                    <input type="number" min="0" {...field('stockDisponible')} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-black tracking-widest mb-2 block">Mínimo</label>
                    <input type="number" min="0" {...field('stockMinimo')} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase font-black tracking-widest mb-2 block">Ubicación almacén</label>
                  <input {...field('ubicacionAlmacen')} placeholder="Estantería A, nivel 2" className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase font-black tracking-widest mb-2 block">Marcas compatibles</label>
                  <input {...field('compatibleMarcas')} placeholder="Volkswagen Golf 2015-2020, Audi A3..." className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase font-black tracking-widest mb-2 block">Descripción</label>
                  <textarea rows={3} {...field('descripcion')} placeholder="Descripción de la pieza..." className={cn(inputCls, 'resize-none')} />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setModal(false)} className="flex-1 h-12 rounded-xl glass border border-white/10 text-slate-400 hover:text-white transition-colors font-bold">
                  Cancelar
                </button>
                <button onClick={handleSave} disabled={saving} className="flex-1 h-12 rounded-xl btn-primary font-bold disabled:opacity-40">
                  {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear pieza'}
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
              <Trash2 className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-black text-white mb-2">¿Eliminar pieza?</h2>
              <p className="text-slate-400 text-sm mb-6">{confirmDel.nombre} ({confirmDel.codigoPieza})</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDel(null)} className="flex-1 h-12 rounded-xl glass border border-white/10 text-slate-400 hover:text-white font-bold">Cancelar</button>
                <button onClick={() => handleDelete(confirmDel)} className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold">Eliminar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
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
