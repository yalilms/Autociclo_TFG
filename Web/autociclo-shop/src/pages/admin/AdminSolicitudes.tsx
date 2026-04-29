import { useState, useEffect } from 'react'
import { Clock, CheckCircle, XCircle, ChevronRight, AlertCircle, ExternalLink } from 'lucide-react'
import { cn, formatPrice } from '../../lib/utils'
import { motion, AnimatePresence } from 'motion/react'
import client from '../../api/client'
import type { SolicitudPresupuesto } from '../../types'

const ESTADO_CFG = {
  PENDIENTE: { label: 'Pendiente',  Icon: Clock,         cls: 'bg-amber-500/10 border-amber-500/20 text-amber-400' },
  APROBADA:  { label: 'Aprobada',   Icon: CheckCircle,   cls: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
  RECHAZADA: { label: 'Rechazada',  Icon: XCircle,       cls: 'bg-red-500/10 border-red-500/20 text-red-400' },
} as const

interface ModalState {
  sol: SolicitudPresupuesto
  tipo: 'aprobar' | 'rechazar'
}

export default function AdminSolicitudes() {
  const [solicitudes, setSolicitudes] = useState<SolicitudPresupuesto[]>([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [modal, setModal]             = useState<ModalState | null>(null)
  const [precio, setPrecio]           = useState('')
  const [respuesta, setRespuesta]     = useState('')
  const [saving, setSaving]           = useState(false)
  const [toast, setToast]             = useState('')

  const load = () => {
    setLoading(true)
    client.get('/solicitudes')
      .then(r => setSolicitudes(r.data))
      .catch(() => setError('Error al cargar solicitudes.'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const openModal = (sol: SolicitudPresupuesto, tipo: 'aprobar' | 'rechazar') => {
    setModal({ sol, tipo })
    setPrecio('')
    setRespuesta('')
  }

  const handleConfirm = async () => {
    if (!modal) return
    if (modal.tipo === 'aprobar' && !precio) return
    setSaving(true)
    try {
      if (modal.tipo === 'aprobar') {
        await client.put(`/solicitudes/${modal.sol.id}/aprobar`, {
          respuestaAdmin: respuesta || 'Solicitud aprobada.',
          precioTotal: parseFloat(precio),
        })
        showToast('Solicitud aprobada y enviada a Odoo.')
      } else {
        await client.put(`/solicitudes/${modal.sol.id}/rechazar`, {
          respuestaAdmin: respuesta || 'Solicitud rechazada.',
        })
        showToast('Solicitud rechazada.')
      }
      setModal(null)
      load()
    } catch {
      showToast('Error al procesar la solicitud.')
    } finally {
      setSaving(false)
    }
  }

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })

  const pendientes = solicitudes.filter(s => s.estado === 'PENDIENTE')
  const resto      = solicitudes.filter(s => s.estado !== 'PENDIENTE')

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">Solicitudes</h1>
          <p className="text-slate-400">{solicitudes.length} en total · {pendientes.length} pendientes</p>
        </div>
        {pendientes.length > 0 && (
          <span className="px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-bold">
            {pendientes.length} requieren acción
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="glass-card h-32 animate-pulse" />)}</div>
      ) : error ? (
        <div className="glass-card p-12 text-center text-red-400">{error}</div>
      ) : (
        <div className="space-y-4">
          {[...pendientes, ...resto].map((sol, idx) => {
            const cfg = ESTADO_CFG[sol.estado] ?? ESTADO_CFG.PENDIENTE
            return (
              <motion.div
                key={sol.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="glass-card overflow-hidden"
              >
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 p-5 border-b border-white/5">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-widest font-black mb-0.5">
                        Solicitud #{sol.id}
                      </p>
                      <span className="text-slate-400 text-sm">{fmt(sol.fechaSolicitud)}</span>
                    </div>
                    {sol.referenciaOdoo && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono glass border-white/10 text-slate-400">
                        {sol.referenciaOdoo}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={cn('flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider', cfg.cls)}>
                      <cfg.Icon className="w-3.5 h-3.5" />
                      {cfg.label}
                    </div>
                    {sol.estado === 'PENDIENTE' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal(sol, 'aprobar')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                        >
                          Aprobar
                        </button>
                        <button
                          onClick={() => openModal(sol, 'rechazar')}
                          className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 text-red-400 text-xs font-bold transition-colors"
                        >
                          Rechazar
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-5 py-4 flex flex-col sm:flex-row gap-6 justify-between">
                  <div className="flex-1 space-y-1.5">
                    {sol.detalles?.map((d, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <ChevronRight className="w-3 h-3 text-blue-500 shrink-0" />
                        <span className="text-white">{d.pieza?.nombre || `Pieza #${d.piezaId}`}</span>
                        <span className="text-slate-500">× {d.cantidad}</span>
                      </div>
                    ))}
                    {sol.notas && (
                      <p className="text-xs italic text-slate-500 mt-2">"{sol.notas}"</p>
                    )}
                  </div>
                  <div className="shrink-0 text-right flex flex-col items-end gap-2">
                    {sol.precioTotal != null && sol.precioTotal > 0 && (
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-0.5">Precio</p>
                        <p className="text-2xl font-mono font-black text-white">{formatPrice(sol.precioTotal)}</p>
                      </div>
                    )}
                    {sol.referenciaOdoo && (
                      <a
                        href="http://109.123.247.31:8069"
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 glass rounded-xl border-white/10 text-xs text-slate-400 hover:text-blue-400 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Ver en Odoo
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Modal aprobar/rechazar */}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) setModal(null) }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card p-8 w-full max-w-md border-white/20"
            >
              <h2 className="text-xl font-black text-white mb-2">
                {modal.tipo === 'aprobar' ? '✅ Aprobar solicitud' : '❌ Rechazar solicitud'} #{modal.sol.id}
              </h2>
              <p className="text-slate-400 text-sm mb-6">
                {modal.sol.detalles?.map(d => `${d.pieza?.nombre || 'Pieza'} ×${d.cantidad}`).join(', ')}
              </p>

              {modal.tipo === 'aprobar' && (
                <div className="mb-4">
                  <label className="text-xs text-slate-500 uppercase font-black tracking-widest mb-2 block">
                    Precio total (€) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={precio}
                    onChange={e => setPrecio(e.target.value)}
                    placeholder="Ej: 450.00"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  {modal.tipo === 'aprobar' && (
                    <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Al aprobar se creará un pedido de venta en Odoo automáticamente.
                    </p>
                  )}
                </div>
              )}

              <div className="mb-6">
                <label className="text-xs text-slate-500 uppercase font-black tracking-widest mb-2 block">
                  Mensaje al cliente (opcional)
                </label>
                <textarea
                  value={respuesta}
                  onChange={e => setRespuesta(e.target.value)}
                  rows={3}
                  placeholder={modal.tipo === 'aprobar' ? 'Solicitud aprobada. Puede pasar a recoger la pieza...' : 'Lo sentimos, la pieza no está disponible...'}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setModal(null)}
                  className="flex-1 h-12 rounded-xl glass border border-white/10 text-slate-400 hover:text-white transition-colors font-bold"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={saving || (modal.tipo === 'aprobar' && !precio)}
                  className={cn(
                    'flex-1 h-12 rounded-xl font-bold text-white transition-all disabled:opacity-40',
                    modal.tipo === 'aprobar'
                      ? 'bg-emerald-600 hover:bg-emerald-500'
                      : 'bg-red-600 hover:bg-red-500'
                  )}
                >
                  {saving ? 'Procesando...' : modal.tipo === 'aprobar' ? 'Aprobar y enviar a Odoo' : 'Rechazar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 px-5 py-3 glass-card border-white/20 text-white text-sm font-bold shadow-xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
