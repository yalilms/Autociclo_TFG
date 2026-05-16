import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Inbox, Clock, CheckCircle, XCircle, ChevronRight, PackageCheck, ArrowLeftRight, Check, X, MessageSquare, CreditCard, BadgeCheck } from 'lucide-react'
import { cn, formatPrice } from '../lib/utils'
import { motion, AnimatePresence } from 'motion/react'
import client from '../api/client'
import type { SolicitudPresupuesto, NegociacionRonda } from '../types'

const ESTADO_CFG = {
  pendiente:      { label: 'Pendiente',      Icon: Clock,          cls: 'bg-amber-500/10 border-amber-500/20 text-amber-400' },
  en_negociacion: { label: 'En negociación', Icon: ArrowLeftRight,  cls: 'bg-purple-500/10 border-purple-500/20 text-purple-400' },
  aprobada:       { label: 'Aprobada',       Icon: CheckCircle,    cls: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
  rechazada:      { label: 'Rechazada',      Icon: XCircle,        cls: 'bg-red-500/10 border-red-500/20 text-red-400' },
  pagada:         { label: 'Pagada',         Icon: BadgeCheck,     cls: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
} as const

export default function MisSolicitudes() {
  const navigate = useNavigate()
  const [solicitudes, setSolicitudes]     = useState<SolicitudPresupuesto[]>([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState('')
  const [accionando, setAccionando]       = useState<number | null>(null)
  const [nuevaOfertaId, setNuevaOfertaId] = useState<number | null>(null)
  const [nuevoPrecio, setNuevoPrecio]     = useState('')
  const [nuevoMensaje, setNuevoMensaje]   = useState('')

  const cargar = () => {
    client.get('/solicitudes')
      .then(res => setSolicitudes(res.data))
      .catch(() => setError('No se pudieron cargar las solicitudes.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [])

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })

  const aceptarOferta = async (idSolicitud: number) => {
    setAccionando(idSolicitud)
    try {
      await client.put(`/solicitudes/${idSolicitud}/aceptar-oferta`)
      cargar()
    } catch { setError('Error al aceptar la oferta. Inténtalo de nuevo.') }
    finally { setAccionando(null) }
  }

  const rechazarOferta = async (idSolicitud: number) => {
    setAccionando(idSolicitud)
    try {
      await client.put(`/solicitudes/${idSolicitud}/rechazar-oferta`)
      cargar()
    } catch { setError('Error al rechazar la oferta.') }
    finally { setAccionando(null) }
  }

  const enviarNuevaOferta = async (idSolicitud: number) => {
    const precio = parseFloat(nuevoPrecio)
    if (!nuevoPrecio || isNaN(precio) || precio <= 0) return
    setAccionando(idSolicitud)
    try {
      await client.put(`/solicitudes/${idSolicitud}/nueva-oferta`, { precio, mensaje: nuevoMensaje })
      setNuevaOfertaId(null)
      setNuevoPrecio('')
      setNuevoMensaje('')
      cargar()
    } catch { setError('Error al enviar tu oferta.') }
    finally { setAccionando(null) }
  }

  return (
    <>
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-10">

      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">Mis Solicitudes</h1>
          <p className="text-slate-400">
            {solicitudes.length > 0 ? `${solicitudes.length} solicitudes en total` : 'Sin solicitudes aún'}
          </p>
        </div>
        <button onClick={() => navigate('/solicitar')} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nueva solicitud
        </button>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="glass-card h-32 animate-pulse" />)}
        </div>
      ) : solicitudes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-20 text-center flex flex-col items-center gap-6"
        >
          <Inbox className="w-16 h-16 text-slate-700" />
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Sin solicitudes todavía</h3>
            <p className="text-slate-400">Busca una pieza y solicita tu primer presupuesto gratuito.</p>
          </div>
          <button onClick={() => navigate('/catalogo')} className="btn-primary">Explorar catálogo</button>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {solicitudes.map((sol, idx) => {
            const cfg = ESTADO_CFG[sol.estado] ?? ESTADO_CFG.pendiente
            const enNegociacionTurnoCliente = sol.estado === 'en_negociacion' && sol.turno === 'cliente'
            const enNegociacionTurnoAdmin   = sol.estado === 'en_negociacion' && sol.turno === 'admin'
            const mostrandoFormOferta       = nuevaOfertaId === sol.idSolicitud

            return (
              <motion.div
                key={sol.idSolicitud}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-card overflow-hidden"
              >
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 p-6 pb-4 border-b border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0">
                      <PackageCheck className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-widest font-black mb-1">
                        Solicitud #{sol.idSolicitud}
                      </p>
                      <span className="text-slate-400 text-sm">{fmt(sol.fechaSolicitud)}</span>
                    </div>
                    {sol.referenciaOdoo && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono glass border-white/10 text-slate-400">
                        {sol.referenciaOdoo}
                      </span>
                    )}
                  </div>
                  <div className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold uppercase tracking-wider w-fit',
                    cfg.cls
                  )}>
                    <cfg.Icon className="w-4 h-4" />
                    {cfg.label}
                  </div>
                </div>

                {/* Piezas */}
                <div className="px-6 pt-5 flex flex-col sm:flex-row gap-6 justify-between">
                  <div className="flex-1 space-y-2">
                    {sol.detalles?.map((d, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <ChevronRight className="w-3 h-3 text-blue-500 shrink-0" />
                        <span className="text-white">{d.pieza?.nombre || `Pieza #${d.id?.idPieza}`}</span>
                        <span className="text-slate-500">× {d.cantidad}</span>
                      </div>
                    ))}
                  </div>
                  <div className="shrink-0 text-right flex flex-col items-end gap-3">
                    {sol.precioTotal != null && sol.precioTotal > 0 && (
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Precio final</p>
                        <p className="text-3xl font-mono font-black text-emerald-400">{formatPrice(sol.precioTotal)}</p>
                      </div>
                    )}
                    {sol.estado === 'aprobada' && (
                      <button
                        onClick={() => navigate(`/pagar?id=${sol.idSolicitud}`)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors shadow-lg shadow-emerald-900/30"
                      >
                        <CreditCard className="w-4 h-4" />
                        Pagar {sol.precioTotal != null ? formatPrice(sol.precioTotal) : ''}
                      </button>
                    )}
                    {sol.estado === 'pagada' && (
                      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold">
                        <BadgeCheck className="w-4 h-4" />
                        Pagado {sol.precioTotal != null ? formatPrice(sol.precioTotal) : ''}
                      </div>
                    )}
                    {sol.estado === 'rechazada' && (
                      <button onClick={() => navigate('/solicitar')}
                        className="text-xs text-slate-400 hover:text-blue-400 transition-colors">
                        Solicitar de nuevo →
                      </button>
                    )}
                  </div>
                </div>

                {/* Historial de negociación */}
                {sol.historial && sol.historial.length > 0 && (
                  <div className="mx-6 mt-5 mb-2">
                    {/* Último movimiento indicator */}
                    {(() => {
                      const ultimo = sol.historial![sol.historial!.length - 1]
                      return (
                        <div className={cn(
                          'flex items-center justify-between px-4 py-2.5 rounded-xl border mb-3',
                          ultimo.autor === 'cliente'
                            ? 'bg-blue-500/10 border-blue-500/20'
                            : 'bg-purple-500/10 border-purple-500/20'
                        )}>
                          <div className="flex items-center gap-2">
                            <span className={cn('text-xs font-bold uppercase tracking-wider',
                              ultimo.autor === 'cliente' ? 'text-blue-400' : 'text-purple-400')}>
                              {ultimo.autor === 'cliente' ? '⚡ Último movimiento: Tú' : '⚡ Último movimiento: AutoCiclo'}
                            </span>
                            <span className="text-slate-500 text-xs">· {fmt(ultimo.fecha)}</span>
                          </div>
                          <span className="font-mono font-bold text-white text-sm">{formatPrice(ultimo.precio)}</span>
                        </div>
                      )
                    })()}

                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold flex items-center gap-1.5 mb-3">
                      <MessageSquare className="w-3 h-3" /> Conversación completa
                    </p>
                    <div className="space-y-2">
                      {sol.historial.map((r: NegociacionRonda, idx: number) => {
                        const esUltimo = idx === sol.historial!.length - 1
                        return (
                          <div key={r.id} className={cn(
                            'flex gap-3 p-3 rounded-xl border text-sm transition-all',
                            r.autor === 'cliente'
                              ? 'bg-blue-500/5 border-blue-500/15 ml-6'
                              : 'bg-purple-500/5 border-purple-500/15 mr-6',
                            esUltimo && 'ring-1',
                            esUltimo && r.autor === 'cliente' && 'ring-blue-500/30',
                            esUltimo && r.autor === 'admin' && 'ring-purple-500/30'
                          )}>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <span className={cn('text-xs font-bold uppercase tracking-wider',
                                    r.autor === 'cliente' ? 'text-blue-400' : 'text-purple-400')}>
                                    {r.autor === 'cliente' ? 'Tú' : 'AutoCiclo'}
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
                  </div>
                )}

                {/* Panel de acción: turno del cliente en negociación */}
                <AnimatePresence>
                  {enNegociacionTurnoCliente && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mx-6 mb-6 mt-4"
                    >
                      <div className="p-5 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                        <p className="text-purple-300 font-bold text-sm mb-1">AutoCiclo propone un nuevo precio</p>
                        <p className="text-3xl font-mono font-black text-white mb-1">
                          {formatPrice(sol.precioContraoferta ?? 0)}
                        </p>
                        {sol.respuestaAdmin && (
                          <p className="text-xs text-slate-400 italic mb-4">"{sol.respuestaAdmin}"</p>
                        )}

                        {!mostrandoFormOferta ? (
                          <div className="flex flex-wrap gap-3 mt-4">
                            <button
                              onClick={() => aceptarOferta(sol.idSolicitud)}
                              disabled={accionando === sol.idSolicitud}
                              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm transition-colors disabled:opacity-50"
                            >
                              <Check className="w-4 h-4" />
                              Aceptar {formatPrice(sol.precioContraoferta ?? 0)}
                            </button>
                            <button
                              onClick={() => setNuevaOfertaId(sol.idSolicitud)}
                              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-colors"
                            >
                              <ArrowLeftRight className="w-4 h-4" />
                              Proponer otro precio
                            </button>
                            <button
                              onClick={() => rechazarOferta(sol.idSolicitud)}
                              disabled={accionando === sol.idSolicitud}
                              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 font-bold text-sm transition-colors disabled:opacity-50"
                            >
                              <X className="w-4 h-4" />
                              Rechazar
                            </button>
                          </div>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 space-y-3"
                          >
                            <input
                              type="number" min="1" step="0.01"
                              value={nuevoPrecio}
                              onChange={e => setNuevoPrecio(e.target.value)}
                              placeholder="Tu nuevo precio (€)"
                              className="w-full bg-slate-900 border border-blue-500/30 rounded-xl p-3 text-white font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <textarea
                              value={nuevoMensaje}
                              onChange={e => setNuevoMensaje(e.target.value)}
                              placeholder="Justificación (opcional)…"
                              rows={2}
                              className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => enviarNuevaOferta(sol.idSolicitud)}
                                disabled={accionando === sol.idSolicitud || !nuevoPrecio}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-colors disabled:opacity-50"
                              >
                                {accionando === sol.idSolicitud
                                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  : <ArrowLeftRight className="w-4 h-4" />}
                                Enviar oferta
                              </button>
                              <button
                                onClick={() => { setNuevaOfertaId(null); setNuevoPrecio(''); setNuevoMensaje('') }}
                                className="px-4 py-2.5 rounded-xl glass border-white/10 text-slate-400 hover:text-white text-sm transition-colors"
                              >
                                Cancelar
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {enNegociacionTurnoAdmin && (
                    <motion.div
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="mx-6 mb-6 mt-4 px-5 py-4 rounded-xl bg-slate-800/50 border border-white/10 text-sm text-slate-400"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="font-bold text-amber-400">Esperando respuesta del equipo</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Tu oferta de <strong className="text-white">{formatPrice(sol.precioOfertaCliente ?? 0)}</strong> está pendiente de revisión. AutoCiclo puede aceptarla, rechazarla o hacerte una nueva contraoferta.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

              </motion.div>
            )
          })}
        </div>
      )}
    </div>

    </>
  )
}
