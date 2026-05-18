import { useState, useEffect } from 'react'
import {
  Clock, CheckCircle, XCircle, ChevronRight, AlertCircle,
  ExternalLink, ArrowLeftRight, MessageSquare, Check, X, BadgeCheck, Truck
} from 'lucide-react'
import { cn, formatPrice } from '../../lib/utils'
import { motion, AnimatePresence } from 'motion/react'
import client from '../../api/client'
import type { SolicitudPresupuesto, NegociacionRonda } from '../../types'

const ESTADO_CFG = {
  pendiente:      { label: 'Pendiente',      Icon: Clock,          cls: 'bg-amber-500/10 border-amber-500/20 text-amber-400' },
  en_negociacion: { label: 'En negociación', Icon: ArrowLeftRight,  cls: 'bg-purple-500/10 border-purple-500/20 text-purple-400' },
  aprobada:       { label: 'Aprobada',       Icon: CheckCircle,    cls: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
  rechazada:      { label: 'Rechazada',      Icon: XCircle,        cls: 'bg-red-500/10 border-red-500/20 text-red-400' },
  pagada:         { label: 'Pagada',         Icon: BadgeCheck,     cls: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
  enviado:        { label: 'Enviado',        Icon: Truck,          cls: 'bg-teal-500/10 border-teal-500/20 text-teal-400' },
} as const

type ModalTipo = 'aprobar' | 'rechazar' | 'contraofertar'
interface ModalState { sol: SolicitudPresupuesto; tipo: ModalTipo }

export default function AdminSolicitudes() {
  const [solicitudes, setSolicitudes] = useState<SolicitudPresupuesto[]>([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [modal, setModal]             = useState<ModalState | null>(null)
  const [precio, setPrecio]           = useState('')
  const [respuesta, setRespuesta]     = useState('')
  const [saving, setSaving]           = useState(false)
  const [toast, setToast]             = useState('')
  const [expanded, setExpanded]       = useState<Set<number>>(new Set())

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
    setTimeout(() => setToast(''), 3500)
  }

  const openModal = (sol: SolicitudPresupuesto, tipo: ModalTipo) => {
    setModal({ sol, tipo })
    setPrecio(tipo === 'aprobar' ? String(sol.precioOfertaCliente ?? '') : '')
    setRespuesta('')
  }

  const toggleExpand = (id: number) => {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleConfirm = async () => {
    if (!modal) return
    if ((modal.tipo === 'aprobar' || modal.tipo === 'contraofertar') && !precio) return
    setSaving(true)
    try {
      if (modal.tipo === 'aprobar') {
        await client.put(`/solicitudes/${modal.sol.idSolicitud}/aprobar`, {
          respuestaAdmin: respuesta || 'Solicitud aprobada. Pedido generado en Odoo. Contactaremos para la entrega.',
          precioTotal: parseFloat(precio),
        })
        showToast('Solicitud aprobada y enviada a Odoo.')
      } else if (modal.tipo === 'rechazar') {
        await client.put(`/solicitudes/${modal.sol.idSolicitud}/rechazar`, {
          respuestaAdmin: respuesta || 'Solicitud rechazada.',
        })
        showToast('Solicitud rechazada.')
      } else {
        await client.put(`/solicitudes/${modal.sol.idSolicitud}/contraoferta`, {
          precio: parseFloat(precio),
          mensaje: respuesta,
        })
        showToast('Contraoferta enviada al cliente.')
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

  const pendientes     = solicitudes.filter(s => s.estado === 'pendiente')
  const enNegociacion  = solicitudes.filter(s => s.estado === 'en_negociacion')
  const resto          = solicitudes.filter(s => s.estado !== 'pendiente' && s.estado !== 'en_negociacion')

  const actionButtons = (sol: SolicitudPresupuesto, turnoAdmin: boolean) => (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => openModal(sol, 'aprobar')}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
      >
        <Check className="w-3.5 h-3.5" />
        {turnoAdmin ? `Aceptar ${formatPrice(sol.precioOfertaCliente ?? 0)}` : 'Aprobar'}
      </button>
      <button
        onClick={() => openModal(sol, 'contraofertar')}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors"
      >
        <ArrowLeftRight className="w-3.5 h-3.5" />
        Contraofertar
      </button>
      <button
        onClick={() => openModal(sol, 'rechazar')}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 text-red-400 text-xs font-bold transition-colors"
      >
        <X className="w-3.5 h-3.5" />
        Rechazar
      </button>
    </div>
  )

  const renderCard = (sol: SolicitudPresupuesto, idx: number) => {
    const cfg = ESTADO_CFG[sol.estado] ?? ESTADO_CFG.pendiente
    const esPendiente = sol.estado === 'pendiente'
    const turnoAdmin  = sol.estado === 'en_negociacion' && sol.turno === 'admin'
    const turnoCliente = sol.estado === 'en_negociacion' && sol.turno === 'cliente'
    const tieneHistorial = (sol.historial?.length ?? 0) > 0
    const isExpanded = expanded.has(sol.idSolicitud)

    return (
      <motion.div
        key={sol.idSolicitud}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.04 }}
        className="glass-card overflow-hidden"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 p-5 border-b border-white/5">
          <div className="flex items-start gap-4 flex-1">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <p className="text-xs text-slate-500 uppercase tracking-widest font-black">
                  Solicitud #{sol.idSolicitud}
                </p>
                <span className="text-slate-500 text-xs">{fmt(sol.fechaSolicitud)}</span>
                {sol.referenciaOdoo && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono glass border-white/10 text-slate-400">
                    {sol.referenciaOdoo}
                  </span>
                )}
              </div>
              {/* Nombre cliente */}
              {sol.cliente?.usuario?.nombre && (
                <p className="text-white font-bold text-sm">{sol.cliente.usuario.nombre}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className={cn('flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider', cfg.cls)}>
              <cfg.Icon className="w-3.5 h-3.5" />
              {cfg.label}
            </div>

            {(esPendiente || turnoAdmin) && actionButtons(sol, turnoAdmin)}

            {turnoCliente && (
              <span className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
                ⏳ Esperando respuesta del cliente
              </span>
            )}
          </div>
        </div>

        {/* Ofertas row (para solicitudes con negociación) */}
        {(sol.precioOfertaCliente != null || sol.precioContraoferta != null) && (
          <div className="px-5 pt-4 flex flex-wrap gap-6">
            {sol.precioOfertaCliente != null && (
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-0.5">Oferta cliente</p>
                <p className="text-lg font-mono font-black text-blue-400">{formatPrice(sol.precioOfertaCliente)}</p>
              </div>
            )}
            {sol.precioContraoferta != null && (
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-0.5">Tu contraoferta</p>
                <p className="text-lg font-mono font-black text-purple-400">{formatPrice(sol.precioContraoferta)}</p>
              </div>
            )}
            {sol.precioTotal != null && sol.precioTotal > 0 && (
              <div className="ml-auto text-right">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-0.5">Precio final</p>
                <p className="text-2xl font-mono font-black text-white">{formatPrice(sol.precioTotal)}</p>
              </div>
            )}
          </div>
        )}

        {/* Piezas */}
        <div className="px-5 py-4 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex-1 space-y-1.5">
            {sol.detalles?.map((d, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <ChevronRight className="w-3 h-3 text-blue-500 shrink-0" />
                <span className="text-white">{d.pieza?.nombre || `Pieza #${d.id?.idPieza}`}</span>
                <span className="text-slate-500">× {d.cantidad}</span>
              </div>
            ))}
            {sol.respuestaAdmin && (
              <p className="text-xs italic text-slate-500 mt-2">"{sol.respuestaAdmin}"</p>
            )}
          </div>
          <div className="flex items-start gap-3">
            {sol.referenciaOdoo && (
              <a href="http://109.123.247.31:8069" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 glass rounded-xl border-white/10 text-xs text-slate-400 hover:text-blue-400 transition-colors">
                <ExternalLink className="w-3 h-3" />Ver en Odoo
              </a>
            )}
            {tieneHistorial && (
              <button
                onClick={() => toggleExpand(sol.idSolicitud)}
                className="flex items-center gap-1.5 px-3 py-1.5 glass rounded-xl border-white/10 text-xs text-slate-400 hover:text-purple-400 hover:border-purple-500/30 transition-colors"
              >
                <MessageSquare className="w-3 h-3" />
                Historial ({sol.historial!.length} rondas)
              </button>
            )}
          </div>
        </div>

        {/* Historial expandible */}
        <AnimatePresence>
          {tieneHistorial && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 space-y-2 border-t border-white/5 pt-4">
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold flex items-center gap-1.5 mb-3">
                  <MessageSquare className="w-3 h-3" /> Historial de negociación
                </p>
                {sol.historial!.map((r: NegociacionRonda, i: number) => {
                  const esUltimo = i === sol.historial!.length - 1
                  return (
                    <div key={r.id} className={cn(
                      'flex gap-3 p-3 rounded-xl border text-sm',
                      r.autor === 'cliente'
                        ? 'bg-blue-500/5 border-blue-500/15 ml-8'
                        : 'bg-purple-500/5 border-purple-500/15 mr-8',
                      esUltimo && 'ring-1',
                      esUltimo && r.autor === 'cliente' && 'ring-blue-500/30',
                      esUltimo && r.autor === 'admin' && 'ring-purple-500/30'
                    )}>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className={cn('text-xs font-bold uppercase tracking-wider',
                              r.autor === 'cliente' ? 'text-blue-400' : 'text-purple-400')}>
                              {r.autor === 'cliente' ? 'Cliente' : 'Admin (Tú)'}
                            </span>
                            <span className="text-slate-600 text-xs">Ronda {r.ronda}</span>
                            {esUltimo && <span className="text-[10px] bg-white/10 text-slate-300 px-1.5 py-0.5 rounded font-bold">ÚLTIMO</span>}
                          </div>
                          <span className="text-slate-500 text-xs">{fmt(r.fecha)}</span>
                        </div>
                        {r.mensaje && <p className="text-slate-300 text-xs mb-1 italic">"{r.mensaje}"</p>}
                        <span className="font-mono font-bold text-white">{formatPrice(r.precio)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">Solicitudes</h1>
          <p className="text-slate-400">{solicitudes.length} en total</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          {pendientes.length > 0 && (
            <span className="px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-bold">
              {pendientes.length} pendientes
            </span>
          )}
          {enNegociacion.filter(s => s.turno === 'admin').length > 0 && (
            <span className="px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-bold">
              {enNegociacion.filter(s => s.turno === 'admin').length} en negociación — tu turno
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="glass-card h-32 animate-pulse" />)}</div>
      ) : error ? (
        <div className="glass-card p-12 text-center text-red-400">{error}</div>
      ) : (
        <div className="space-y-4">
          {[...pendientes, ...enNegociacion, ...resto].map((sol, idx) => renderCard(sol, idx))}
        </div>
      )}

      {/* Modal aprobar / rechazar / contraofertar */}
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
              <h2 className="text-xl font-black text-white mb-1">
                {modal.tipo === 'aprobar' ? '✅ Aprobar' : modal.tipo === 'rechazar' ? '❌ Rechazar' : '↔ Contraofertar'}
                {' '}solicitud #{modal.sol.idSolicitud}
              </h2>
              <p className="text-slate-400 text-sm mb-6">
                {modal.sol.detalles?.map(d => `${d.pieza?.nombre || 'Pieza'} ×${d.cantidad}`).join(', ')}
              </p>

              {modal.sol.precioOfertaCliente != null && (
                <div className="mb-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <p className="text-xs text-slate-400 mb-0.5">Oferta actual del cliente</p>
                  <p className="text-2xl font-mono font-black text-blue-400">{formatPrice(modal.sol.precioOfertaCliente)}</p>
                </div>
              )}

              {(modal.tipo === 'aprobar' || modal.tipo === 'contraofertar') && (
                <div className="mb-4">
                  <label className="text-xs text-slate-500 uppercase font-black tracking-widest mb-2 block">
                    {modal.tipo === 'aprobar' ? 'Precio final (€) *' : 'Tu nuevo precio (€) *'}
                  </label>
                  <input
                    type="number" min="0" step="0.01"
                    value={precio}
                    onChange={e => setPrecio(e.target.value)}
                    placeholder="Ej: 450.00"
                    autoFocus
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
                  placeholder={
                    modal.tipo === 'aprobar'
                      ? 'Solicitud aprobada. Contactaremos para la entrega...'
                      : modal.tipo === 'rechazar'
                      ? 'Lo sentimos, la pieza no está disponible...'
                      : 'No podemos bajar de ese precio porque...'
                  }
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
                  disabled={saving || ((modal.tipo === 'aprobar' || modal.tipo === 'contraofertar') && !precio)}
                  className={cn(
                    'flex-1 h-12 rounded-xl font-bold text-white transition-all disabled:opacity-40',
                    modal.tipo === 'aprobar'   ? 'bg-emerald-600 hover:bg-emerald-500' :
                    modal.tipo === 'rechazar'  ? 'bg-red-600 hover:bg-red-500' :
                                                 'bg-blue-600 hover:bg-blue-500'
                  )}
                >
                  {saving ? 'Procesando...' :
                   modal.tipo === 'aprobar' ? 'Aprobar y enviar a Odoo' :
                   modal.tipo === 'rechazar' ? 'Rechazar solicitud' :
                   'Enviar contraoferta'}
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
