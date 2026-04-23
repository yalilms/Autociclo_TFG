import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Inbox, Clock, CheckCircle, XCircle, ChevronRight, ExternalLink } from 'lucide-react'
import client from '../api/client'
import type { SolicitudPresupuesto } from '../types'

const ESTADO = {
  PENDIENTE: { label: 'Pendiente',  Icon: Clock,         cls: 'bg-amber-100 text-amber-700' },
  APROBADA:  { label: 'Aprobada',   Icon: CheckCircle,   cls: 'bg-green-100 text-green-700' },
  RECHAZADA: { label: 'Rechazada',  Icon: XCircle,       cls: 'bg-red-100 text-red-700' },
} as const

export default function MisSolicitudes() {
  const navigate = useNavigate()
  const [solicitudes, setSolicitudes] = useState<SolicitudPresupuesto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    client.get('/solicitudes')
      .then(res => setSolicitudes(res.data))
      .catch(() => setError('No se pudieron cargar las solicitudes.'))
      .finally(() => setLoading(false))
  }, [])

  const fmt = (d: string) => new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div className="h-full flex flex-col gap-5">
      {/* Header */}
      <div className="card overflow-hidden shrink-0">
        <div className="card-header">
          <span className="card-title">Historial de solicitudes — {solicitudes.length} total</span>
          <button
            onClick={() => navigate('/solicitar')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-[11px] font-bold rounded hover:bg-blue-600 transition-colors uppercase tracking-widest"
          >
            <Plus className="w-3 h-3" /> Nueva solicitud
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="card h-28 animate-pulse" />)}
          </div>
        ) : error ? (
          <div className="card p-10 text-center">
            <p className="text-body-sm text-red-600">{error}</p>
          </div>
        ) : solicitudes.length === 0 ? (
          <div className="card p-14 text-center">
            <Inbox className="w-12 h-12 mx-auto mb-4 text-on-surface-variant opacity-30" />
            <h2 className="text-h3 mb-1">Sin solicitudes todavía</h2>
            <p className="text-body-sm mb-5">Busca una pieza y solicita tu primer presupuesto.</p>
            <button
              onClick={() => navigate('/catalogo')}
              className="px-5 py-2 bg-primary text-white text-[12px] font-bold rounded hover:bg-blue-600 transition-colors uppercase tracking-widest"
            >
              Explorar catálogo
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {solicitudes.map(sol => {
              const cfg = ESTADO[sol.estado] ?? ESTADO.PENDIENTE
              return (
                <div key={sol.id} className="card overflow-hidden">
                  {/* Header row */}
                  <div className="card-header bg-surface-dim">
                    <div className="flex items-center gap-3">
                      <span className="text-[13px] font-bold text-on-surface">Solicitud #{sol.id}</span>
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${cfg.cls}`}>
                        <cfg.Icon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                      {sol.referenciaOdoo && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-surface-dim border border-outline-variant text-on-surface-variant">
                          {sol.referenciaOdoo}
                        </span>
                      )}
                    </div>
                    <span className="text-body-sm">{fmt(sol.fechaSolicitud)}</span>
                  </div>

                  {/* Body */}
                  <div className="px-5 py-4 flex flex-col sm:flex-row gap-4 justify-between">
                    <div className="flex-1">
                      {sol.detalles?.length > 0 && (
                        <div className="space-y-1 mb-3">
                          {sol.detalles.map((d, i) => (
                            <div key={i} className="flex items-center gap-2 text-[12px]">
                              <ChevronRight className="w-3 h-3 text-primary shrink-0" />
                              <span className="text-on-surface">{d.pieza?.nombre || `Pieza #${d.piezaId}`}</span>
                              <span className="text-on-surface-variant">× {d.cantidad}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {sol.notas && (
                        <p className="text-[11px] italic text-on-surface-variant">"{sol.notas}"</p>
                      )}
                    </div>

                    <div className="shrink-0 text-right flex flex-col items-end gap-2">
                      {sol.precioTotal != null && sol.precioTotal > 0 && (
                        <div>
                          <p className="text-label-caps mb-0.5">Precio aprobado</p>
                          <p className="text-2xl font-mono font-bold text-primary">{sol.precioTotal.toFixed(2)} €</p>
                        </div>
                      )}
                      {sol.estado === 'APROBADA' && sol.referenciaOdoo && (
                        <a
                          href="http://109.123.247.31:8069"
                          target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-outline-variant rounded text-[11px] text-on-surface-variant hover:text-primary hover:border-primary transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Ver en Odoo
                        </a>
                      )}
                      {sol.estado === 'RECHAZADA' && (
                        <button
                          onClick={() => navigate('/solicitar')}
                          className="text-[12px] text-on-surface-variant hover:text-primary transition-colors"
                        >
                          Solicitar de nuevo →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
