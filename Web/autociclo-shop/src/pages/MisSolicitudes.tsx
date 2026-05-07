import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Inbox, Clock, CheckCircle, XCircle, ChevronRight, ExternalLink, PackageCheck } from 'lucide-react'
import { cn, formatPrice } from '../lib/utils'
import { motion } from 'motion/react'
import client from '../api/client'
import type { SolicitudPresupuesto } from '../types'

const ESTADO_CFG = {
  pendiente:   { label: 'Pendiente',   Icon: Clock,         cls: 'bg-amber-500/10 border-amber-500/20 text-amber-400' },
  en_revision: { label: 'En revisión', Icon: Clock,         cls: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
  aprobada:    { label: 'Aprobada',    Icon: CheckCircle,   cls: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
  rechazada:   { label: 'Rechazada',   Icon: XCircle,       cls: 'bg-red-500/10 border-red-500/20 text-red-400' },
} as const

export default function MisSolicitudes() {
  const navigate = useNavigate()
  const [solicitudes, setSolicitudes] = useState<SolicitudPresupuesto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    client.get('/solicitudes')
      .then(res => setSolicitudes(res.data))
      .catch(() => setError('No se pudieron cargar las solicitudes.'))
      .finally(() => setLoading(false))
  }, [])

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">Mis Solicitudes</h1>
          <p className="text-slate-400">
            {solicitudes.length > 0 ? `${solicitudes.length} solicitudes en total` : 'Sin solicitudes aún'}
          </p>
        </div>
        <button
          onClick={() => navigate('/solicitar')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nueva solicitud
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="glass-card h-32 animate-pulse" />)}
        </div>
      ) : error ? (
        <div className="glass-card p-12 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      ) : solicitudes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-20 text-center flex flex-col items-center gap-6"
        >
          <Inbox className="w-16 h-16 text-slate-700" />
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Sin solicitudes todavía</h3>
            <p className="text-slate-400">Busca una pieza y solicita tu primer presupuesto gratuito.</p>
          </div>
          <button onClick={() => navigate('/catalogo')} className="btn-primary">
            Explorar catálogo
          </button>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {solicitudes.map((sol, idx) => {
            const cfg = ESTADO_CFG[sol.estado] ?? ESTADO_CFG.pendiente
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

                {/* Body */}
                <div className="px-6 py-5 flex flex-col sm:flex-row gap-6 justify-between">
                  <div className="flex-1 space-y-2">
                    {sol.detalles?.length > 0 && sol.detalles.map((d, i) => (
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

                  <div className="shrink-0 text-right flex flex-col items-end gap-3">
                    {sol.precioTotal != null && sol.precioTotal > 0 && (
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Precio aprobado</p>
                        <p className="text-3xl font-mono font-black text-white">{formatPrice(sol.precioTotal)}</p>
                      </div>
                    )}

                    {sol.estado === 'aprobada' && sol.referenciaOdoo && (
                      <a
                        href="http://109.123.247.31:8069"
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2 glass rounded-xl border-white/10 text-xs text-slate-400 hover:text-blue-400 hover:border-blue-500/30 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Ver en Odoo
                      </a>
                    )}

                    {sol.estado === 'rechazada' && (
                      <button
                        onClick={() => navigate('/solicitar')}
                        className="text-xs text-slate-400 hover:text-blue-400 transition-colors"
                      >
                        Solicitar de nuevo →
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
