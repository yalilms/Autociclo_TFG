import { useState, useEffect, useRef } from 'react'
import { Plus, Pencil, Trash2, X, AlertCircle, ImagePlus } from 'lucide-react'
import { cn, formatPrice } from '../../lib/utils'
import { motion, AnimatePresence } from 'motion/react'
import client from '../../api/client'
import type { Pieza } from '../../types'

const CATEGORIAS = ['motor', 'carroceria', 'interior', 'electronica', 'ruedas', 'otros']

const UBICACIONES_PIEZA = [
  'Estantería A, nivel 1','Estantería A, nivel 2','Estantería B, nivel 1','Estantería B, nivel 2',
  'Estantería C, nivel 1','Estantería D, nivel 3','Zona motores, pasillo 1','Zona motores, pasillo 2',
  'Zona motores, pasillo 3','Zona carrocería, pasillo 1','Zona carrocería, pasillo 2',
  'Zona interior, pasillo 1','Zona electrónica, pasillo 1','Zona frenos, estante bajo',
  'Almacén exterior','Caja fuerte, estante especial',
]

const MARCAS = [
  'Abarth','Alfa Romeo','Audi','BMW','Citroën','Cupra','Dacia','Fiat','Ford','Honda',
  'Hyundai','Jeep','Kia','Land Rover','Lexus','Mazda','Mercedes-Benz','MG','Mini',
  'Mitsubishi','Nissan','Opel','Peugeot','Porsche','Renault','SEAT','Skoda','Subaru',
  'Suzuki','Tesla','Toyota','Volkswagen','Volvo',
]

const CAT_PREFIX: Record<string, string> = {
  motor: 'MOT', carroceria: 'CAR', interior: 'INT',
  electronica: 'ELE', ruedas: 'RUE', otros: 'OTR',
}

function nextCodigo(piezas: Pieza[], categoria: string): string {
  const prefix = CAT_PREFIX[categoria] ?? 'OTR'
  const nums = piezas
    .map(p => { const m = p.codigoPieza.match(/^([A-Z]+)-(\d+)$/); return m && m[1] === prefix ? parseInt(m[2]) : 0 })
    .filter(n => n > 0)
  const next = nums.length ? Math.max(...nums) + 1 : 1
  return `${prefix}-${String(next).padStart(3, '0')}`
}

const EMPTY = { codigoPieza: '', nombre: '', categoria: 'motor', precioVenta: '', stockDisponible: '0', stockMinimo: '1', ubicacionAlmacen: '', compatibleMarcas: '', descripcion: '', imagen: '' }

type FormData = typeof EMPTY

export default function AdminPiezas() {
  const [piezas, setPiezas]     = useState<Pieza[]>([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(false)
  const [editing, setEditing]   = useState<Pieza | null>(null)
  const [form, setForm]         = useState<FormData>(EMPTY)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')
  const imgInputRef             = useRef<HTMLInputElement>(null)
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
    setForm({ ...EMPTY, codigoPieza: nextCodigo(piezas, 'motor') })
    setError('')
    setModal(true)
  }

  const openEdit = (p: Pieza) => {
    setEditing(p)
    setForm({
      codigoPieza: p.codigoPieza,
      nombre: p.nombre,
      categoria: p.categoria,
      precioVenta: String(p.precioVenta),
      stockDisponible: String(p.stockDisponible ?? 0),
      stockMinimo: String(p.stockMinimo ?? 1),
      ubicacionAlmacen: p.ubicacionAlmacen ?? '',
      compatibleMarcas: p.compatibleMarcas ?? '',
      descripcion: p.descripcion ?? '',
      imagen: p.imagen ?? '',
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
        await client.put(`/piezas/${editing.idPieza}`, body)
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
      await client.delete(`/piezas/${p.idPieza}`)
      showToast('Pieza eliminada.')
      setConfirmDel(null)
      load()
    } catch { showToast('Error al eliminar.') }
  }

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setForm(p => ({ ...p, imagen: ev.target?.result as string }))
    reader.readAsDataURL(file)
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
                  key={p.idPieza}
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
                  <td className="px-5 py-4 text-white font-mono">{formatPrice(Number(p.precioVenta))}</td>
                  <td className="px-5 py-4">
                    <span className={cn('font-bold', (p.stockDisponible ?? 0) > 0 ? 'text-emerald-400' : 'text-red-400')}>
                      {p.stockDisponible ?? 0}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-400 text-xs">{p.ubicacionAlmacen || '—'}</td>
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
                    <select
                      {...field('categoria')}
                      onChange={e => {
                        const cat = e.target.value
                        setForm(p => ({
                          ...p,
                          categoria: cat,
                          codigoPieza: editing ? p.codigoPieza : nextCodigo(piezas, cat),
                        }))
                      }}
                      className={inputCls}
                    >
                      {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase font-black tracking-widest mb-2 block">Nombre *</label>
                  <input {...field('nombre')} placeholder="Motor 1.6 TDI" className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-black tracking-widest mb-2 block">Precio (€) *</label>
                    <input type="number" min="0" step="0.01" {...field('precioVenta')} placeholder="0.00" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-black tracking-widest mb-2 block">Stock</label>
                    <p className="text-slate-400 text-sm py-2">Se asigna automáticamente al añadir al inventario</p>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase font-black tracking-widest mb-2 block">Ubicación almacén</label>
                  <select {...field('ubicacionAlmacen')} className={inputCls}>
                    <option value="">— Sin asignar —</option>
                    {UBICACIONES_PIEZA.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase font-black tracking-widest mb-2 block">Marcas compatibles</label>
                  <input {...field('compatibleMarcas')} list="marcas-list" placeholder="Volkswagen, Seat, Audi..." className={inputCls} />
                  <datalist id="marcas-list">
                    {MARCAS.map(m => <option key={m} value={m} />)}
                  </datalist>
                  <p className="text-[10px] text-slate-600 mt-1">Puedes escribir varias marcas separadas por comas</p>
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase font-black tracking-widest mb-2 block">Descripción</label>
                  <textarea rows={3} {...field('descripcion')} placeholder="Descripción de la pieza..." className={cn(inputCls, 'resize-none')} />
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase font-black tracking-widest mb-2 block">Imagen</label>
                  <input ref={imgInputRef} type="file" accept="image/*" onChange={handleImageFile} className="hidden" />
                  <div
                    onClick={() => imgInputRef.current?.click()}
                    className="cursor-pointer rounded-xl border-2 border-dashed border-white/10 hover:border-blue-500/50 transition-colors overflow-hidden"
                  >
                    {form.imagen ? (
                      <div className="relative group">
                        <img src={form.imagen} alt="preview" className="w-full h-40 object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white text-xs font-bold">Cambiar imagen</span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-28 flex flex-col items-center justify-center gap-2 text-slate-500">
                        <ImagePlus className="w-7 h-7" />
                        <span className="text-xs">Haz clic para subir una imagen</span>
                      </div>
                    )}
                  </div>
                  {form.imagen && (
                    <button
                      type="button"
                      onClick={() => setForm(p => ({ ...p, imagen: '' }))}
                      className="mt-2 text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      Quitar imagen
                    </button>
                  )}
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
