import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Plus, X, AlertCircle, CheckCircle, ListPlus } from 'lucide-react'
import client from '../api/client'
import type { Pieza } from '../types'

interface Linea { piezaId: number; cantidad: number; nombre: string; precio: number }

export default function SolicitarPresupuesto() {
  const navigate = useNavigate()
  const location = useLocation()
  const [piezas, setPiezas] = useState<Pieza[]>([])
  const [lineas, setLineas] = useState<Linea[]>([])
  const [notas, setNotas] = useState('')
  const [seleccion, setSeleccion] = useState<number | ''>('')
  const [cantidad, setCantidad] = useState(1)
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    client.get('/piezas').then(res => setPiezas(res.data)).catch(() => {})
    const state = location.state as { piezaId?: number } | null
    if (state?.piezaId) {
      client.get(`/piezas/${state.piezaId}`).then(res => {
        const p: Pieza = res.data
        setLineas([{ piezaId: p.id, cantidad: 1, nombre: p.nombre, precio: p.precio }])
      }).catch(() => {})
    }
  }, [location.state])

  const agregarLinea = () => {
    if (!seleccion) return
    const p = piezas.find(x => x.id === Number(seleccion))
    if (!p) return
    const existe = lineas.find(l => l.piezaId === p.id)
    if (existe) setLineas(prev => prev.map(l => l.piezaId === p.id ? { ...l, cantidad: l.cantidad + cantidad } : l))
    else setLineas(prev => [...prev, { piezaId: p.id, cantidad, nombre: p.nombre, precio: p.precio }])
    setSeleccion(''); setCantidad(1)
  }

  const total = lineas.reduce((a, l) => a + l.precio * l.cantidad, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (lineas.length === 0) { setError('Añade al menos una pieza.'); return }
    setLoading(true)
    try {
      await client.post('/solicitudes', { notas, detalles: lineas.map(l => ({ piezaId: l.piezaId, cantidad: l.cantidad })) })
      setEnviado(true)
    } catch { setError('Error al enviar. Inténtalo de nuevo.') }
    finally { setLoading(false) }
  }

  if (enviado) return (
    <div className="h-full flex items-center justify-center">
      <div className="card p-12 text-center max-w-md w-full">
        <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
        <h2 className="text-h2 mb-2">¡Solicitud enviada!</h2>
        <p className="text-body-sm mb-6">Te responderemos en menos de 24h con el presupuesto definitivo.</p>
        <div className="flex flex-col gap-2">
          <button onClick={() => navigate('/mis-solicitudes')}
            className="w-full py-2.5 bg-primary text-white text-[12px] font-bold rounded hover:bg-blue-600 transition-colors uppercase tracking-widest">
            Ver mis solicitudes
          </button>
          <button onClick={() => navigate('/catalogo')}
            className="w-full py-2.5 border border-primary text-primary text-[12px] font-bold rounded hover:bg-primary-container transition-colors uppercase tracking-widest">
            Seguir buscando
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="h-full flex flex-col gap-5">
      <form onSubmit={handleSubmit} className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-5 overflow-hidden">
        {/* Piezas — 3 cols */}
        <div className="lg:col-span-3 flex flex-col gap-5 overflow-y-auto">
          <div className="card overflow-hidden">
            <div className="card-header">
              <span className="card-title">Añadir piezas</span>
            </div>
            <div className="p-4">
              <div className="flex gap-2 mb-4">
                <select
                  value={seleccion}
                  onChange={e => setSeleccion(e.target.value ? Number(e.target.value) : '')}
                  className="flex-1 py-2 px-3 text-[12px] bg-surface-dim border border-outline-variant rounded outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">Selecciona una pieza...</option>
                  {piezas.map(p => <option key={p.id} value={p.id}>{p.nombre} — {p.precio.toFixed(2)} €</option>)}
                </select>
                <input
                  type="number" min={1} value={cantidad}
                  onChange={e => setCantidad(Math.max(1, Number(e.target.value)))}
                  className="w-16 py-2 px-2 text-[12px] bg-surface-dim border border-outline-variant rounded text-center outline-none focus:ring-1 focus:ring-primary"
                />
                <button type="button" onClick={agregarLinea} disabled={!seleccion}
                  className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white text-[12px] font-bold rounded hover:bg-blue-600 transition-colors disabled:opacity-40">
                  <Plus className="w-3.5 h-3.5" /> Añadir
                </button>
              </div>

              {lineas.length === 0 ? (
                <div className="text-center py-10 text-on-surface-variant">
                  <ListPlus className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-body-sm">Selecciona piezas arriba para añadirlas</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {lineas.map(l => (
                    <div key={l.piezaId} className="flex items-center justify-between p-3 bg-surface-dim rounded border border-outline-variant">
                      <div>
                        <p className="text-[13px] font-semibold text-on-surface">{l.nombre}</p>
                        <p className="text-body-sm">{l.precio.toFixed(2)} € × {l.cantidad}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[13px] font-bold font-mono text-on-surface">{(l.precio * l.cantidad).toFixed(2)} €</span>
                        <button type="button" onClick={() => setLineas(prev => prev.filter(x => x.piezaId !== l.piezaId))}
                          className="text-on-surface-variant hover:text-red-600 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="card-header">
              <span className="card-title">Notas adicionales</span>
            </div>
            <div className="p-4">
              <textarea
                value={notas}
                onChange={e => setNotas(e.target.value)}
                placeholder="Ej: Necesito la pieza para un Seat León 2012 1.6 TDI..."
                rows={3}
                className="w-full py-2 px-3 text-[12px] bg-surface-dim border border-outline-variant rounded outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>
          </div>
        </div>

        {/* Resumen — 2 cols */}
        <div className="lg:col-span-2">
          <div className="card overflow-hidden sticky top-0">
            <div className="card-header">
              <span className="card-title">Resumen del pedido</span>
            </div>
            <div className="p-5 flex flex-col gap-4">
              {lineas.length === 0 ? (
                <p className="text-body-sm text-center py-4">Sin piezas añadidas</p>
              ) : (
                <div className="space-y-2">
                  {lineas.map(l => (
                    <div key={l.piezaId} className="flex justify-between text-[12px]">
                      <span className="text-on-surface-variant truncate mr-2">{l.nombre} ×{l.cantidad}</span>
                      <span className="whitespace-nowrap font-mono font-bold text-on-surface">{(l.precio * l.cantidad).toFixed(2)} €</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-baseline pt-3 border-t border-outline-variant">
                <span className="text-label-caps">Total estimado</span>
                <span className="text-2xl font-mono font-bold text-primary">{total.toFixed(2)} €</span>
              </div>
              <p className="text-[11px] text-on-surface-variant -mt-2">* Precio orientativo. Puede variar.</p>

              {error && (
                <div className="flex items-center gap-2 px-3 py-2 rounded bg-red-50 border border-red-200 text-red-700 text-[12px]">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || lineas.length === 0}
                className="w-full py-3 bg-primary text-white text-[12px] font-bold rounded hover:bg-blue-600 transition-colors uppercase tracking-widest disabled:opacity-40"
              >
                {loading ? 'Enviando...' : 'Enviar solicitud'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
