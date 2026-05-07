import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, X, AlertCircle, CheckCircle2, ListPlus, ShieldCheck, Truck } from 'lucide-react'
import { formatPrice } from '../lib/utils'
import { motion } from 'motion/react'
import client from '../api/client'
import type { Pieza } from '../types'

interface Linea { piezaId: number; cantidad: number; nombre: string; precio: number }

export default function SolicitarPresupuesto() {
  const navigate  = useNavigate()
  const [searchParams] = useSearchParams()
  const [piezas, setPiezas]     = useState<Pieza[]>([])
  const [lineas, setLineas]     = useState<Linea[]>([])
  const [notas, setNotas]       = useState('')
  const [seleccion, setSeleccion] = useState<number | ''>('')
  const [cantidad, setCantidad] = useState(1)
  const [loading, setLoading]   = useState(false)
  const [enviado, setEnviado]   = useState(false)
  const [error, setError]       = useState('')

  useEffect(() => {
    client.get('/piezas').then(res => setPiezas(res.data)).catch(() => {})
    const piezaIdParam = searchParams.get('piezaId')
    if (piezaIdParam) {
      client.get(`/piezas/${piezaIdParam}`).then(res => {
        const p: Pieza = res.data
        setLineas([{ piezaId: p.idPieza, cantidad: 1, nombre: p.nombre, precio: Number(p.precioVenta) }])
      }).catch(() => {})
    }
  }, [searchParams])

  const agregarLinea = () => {
    if (!seleccion) return
    const p = piezas.find(x => x.idPieza === Number(seleccion))
    if (!p) return
    const existe = lineas.find(l => l.piezaId === p.idPieza)
    if (existe) {
      setLineas(prev => prev.map(l => l.piezaId === p.idPieza ? { ...l, cantidad: l.cantidad + cantidad } : l))
    } else {
      setLineas(prev => [...prev, { piezaId: p.idPieza, cantidad, nombre: p.nombre, precio: Number(p.precioVenta) }])
    }
    setSeleccion(''); setCantidad(1)
  }

  const total = lineas.reduce((a, l) => a + l.precio * l.cantidad, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (lineas.length === 0) { setError('Añade al menos una pieza.'); return }
    setLoading(true)
    try {
      await client.post('/solicitudes', {
        detalles: lineas.map((l, i) => ({ idPieza: l.piezaId, cantidad: l.cantidad, notas: i === 0 ? notas : undefined })),
      })
      setEnviado(true)
    } catch { setError('Error al enviar. Inténtalo de nuevo.') }
    finally { setLoading(false) }
  }

  if (enviado) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 glow-green"
        >
          <CheckCircle2 className="w-12 h-12 text-white" />
        </motion.div>
        <h2 className="text-4xl font-black text-white mb-4">¡Solicitud enviada!</h2>
        <p className="text-slate-400 mb-10 text-lg">
          Te responderemos en menos de 24h con el presupuesto definitivo.
        </p>
        <div className="space-y-4">
          <button onClick={() => navigate('/mis-solicitudes')} className="btn-primary w-full h-14 text-lg font-bold">
            Ver mis solicitudes
          </button>
          <button
            onClick={() => navigate('/catalogo')}
            className="btn-secondary w-full h-14 text-lg font-bold"
          >
            Seguir buscando
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-white mb-2">Solicitar Presupuesto</h1>
        <p className="text-slate-400">Añade las piezas que necesitas y te enviamos un precio en 24h.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Piezas + notas */}
          <div className="lg:col-span-2 space-y-8">

            {/* Selector */}
            <section>
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">1</span>
                Selecciona las piezas
              </h2>
              <div className="glass-card p-6 space-y-6">
                <div className="flex gap-3">
                  <select
                    value={seleccion}
                    onChange={e => setSeleccion(e.target.value ? Number(e.target.value) : '')}
                    className="flex-1 bg-slate-900 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Selecciona una pieza...</option>
                    {piezas.map(p => (
                      <option key={p.idPieza} value={p.idPieza}>
                        {p.nombre} — {formatPrice(Number(p.precioVenta))}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number" min={1} value={cantidad}
                    onChange={e => setCantidad(Math.max(1, Number(e.target.value)))}
                    className="w-20 bg-slate-900 border border-white/10 rounded-xl p-3 text-sm text-white text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={agregarLinea}
                    disabled={!seleccion}
                    className="btn-primary flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" /> Añadir
                  </button>
                </div>

                {lineas.length === 0 ? (
                  <div className="text-center py-12 text-slate-600">
                    <ListPlus className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Selecciona piezas arriba para añadirlas</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {lineas.map(l => (
                      <div key={l.piezaId} className="flex items-center justify-between p-4 glass rounded-xl border-white/5">
                        <div>
                          <p className="text-white font-bold">{l.nombre}</p>
                          <p className="text-slate-500 text-xs mt-0.5">{formatPrice(l.precio)} × {l.cantidad}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-white font-mono font-bold">{formatPrice(l.precio * l.cantidad)}</span>
                          <button
                            type="button"
                            onClick={() => setLineas(prev => prev.filter(x => x.piezaId !== l.piezaId))}
                            className="text-slate-500 hover:text-red-400 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Notas */}
            <section>
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">2</span>
                Notas adicionales
              </h2>
              <div className="glass-card p-6">
                <textarea
                  value={notas}
                  onChange={e => setNotas(e.target.value)}
                  placeholder="Ej: Necesito la pieza para un Seat León 2012 1.6 TDI..."
                  rows={4}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>
            </section>
          </div>

          {/* Resumen sticky */}
          <div className="lg:sticky lg:top-32 h-fit">
            <div className="glass-card p-8 border-white/20 glow-blue">
              <h2 className="text-xl font-bold text-white mb-6">Resumen del Pedido</h2>

              <div className="space-y-3 mb-8 min-h-24">
                {lineas.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-4">Sin piezas añadidas</p>
                ) : lineas.map(l => (
                  <div key={l.piezaId} className="flex justify-between text-sm">
                    <span className="text-slate-400 truncate mr-3">{l.nombre} ×{l.cantidad}</span>
                    <span className="text-white font-mono whitespace-nowrap">{formatPrice(l.precio * l.cantidad)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-6 mb-4 flex justify-between items-end">
                <span className="text-slate-400 text-sm">Total estimado</span>
                <span className="text-3xl font-black text-white">{formatPrice(total)}</span>
              </div>
              <p className="text-xs text-amber-400/60 mb-8">* Precio orientativo basado en el catálogo. El precio definitivo lo recibirás en menos de 24h tras revisar el estado real de la pieza.</p>

              {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || lineas.length === 0}
                className="btn-primary w-full h-14 flex items-center justify-center gap-3 text-lg font-bold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <ShieldCheck className="w-6 h-6" />
                )}
                {loading ? 'Enviando...' : 'Enviar solicitud'}
              </button>

              <p className="text-[10px] text-slate-500 text-center mt-6 uppercase tracking-widest font-bold flex items-center justify-center gap-2">
                <Truck className="w-3 h-3" /> Respuesta en menos de 24h
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
