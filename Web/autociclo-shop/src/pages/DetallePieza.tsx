import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ChevronRight, ShieldCheck, Truck, FileText,
  CheckCircle2, Tag, MapPin, AlertCircle
} from 'lucide-react'
import { cn, formatPrice } from '../lib/utils'
import { motion } from 'motion/react'
import client from '../api/client'
import PiezaCard from '../components/PiezaCard'
import type { Pieza, InventarioPieza } from '../types'

export default function DetallePieza() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [pieza, setPieza]         = useState<Pieza | null>(null)
  const [inventario, setInventario] = useState<InventarioPieza[]>([])
  const [relacionadas, setRelacionadas] = useState<Pieza[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')

  useEffect(() => {
    Promise.all([
      client.get(`/piezas/${id}`),
      client.get(`/inventario/pieza/${id}`).catch(() => ({ data: [] })),
    ]).then(([pr, ir]) => {
      const p: Pieza = pr.data
      setPieza(p)
      setInventario(ir.data as InventarioPieza[])
      client.get('/piezas').then(r => {
        setRelacionadas((r.data as Pieza[]).filter(x => x.categoria === p.categoria && x.id !== p.id).slice(0, 3))
      }).catch(() => {})
    }).catch(() => setError('No se pudo cargar la pieza.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="glass-card aspect-square animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="glass-card h-16 animate-pulse" />)}
        </div>
      </div>
    )
  }

  if (error || !pieza) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="glass-card p-16 max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">{error || 'Pieza no encontrada'}</h2>
          <Link to="/catalogo" className="btn-primary inline-block">Volver al catálogo</Link>
        </div>
      </div>
    )
  }

  const stockTotal = inventario.reduce((acc, i) => acc + i.cantidad, 0)
  const enStock = stockTotal > 0

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-8 overflow-x-auto whitespace-nowrap pb-2">
        <Link to="/" className="hover:text-blue-500 transition-colors">Inicio</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/catalogo" className="hover:text-blue-500 transition-colors">Catálogo</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to={`/catalogo?categoria=${pieza.categoria}`} className="hover:text-blue-500 transition-colors capitalize">
          {pieza.categoria}
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-white font-medium">{pieza.nombre}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

        {/* Imagen */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-3xl overflow-hidden aspect-square flex items-center justify-center bg-slate-800/30"
        >
          {pieza.foto ? (
            <img src={pieza.foto} alt={pieza.nombre} className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-4 text-slate-600">
              <Tag className="w-20 h-20 opacity-20" />
              <span className="text-xs font-mono uppercase tracking-widest opacity-30">{pieza.codigoPieza}</span>
            </div>
          )}
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col"
        >
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full bg-blue-600/20 text-blue-400 text-[10px] font-bold capitalize tracking-wider">
                {pieza.categoria}
              </span>
              <span className={cn(
                'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
                enStock ? 'bg-emerald-600/20 text-emerald-400' : 'bg-red-600/20 text-red-400'
              )}>
                {enStock ? `En stock · ${stockTotal} ud.` : 'Sin stock'}
              </span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">{pieza.nombre}</h1>
            <p className="text-xs font-mono text-slate-500 mb-4">Ref: {pieza.codigoPieza}</p>
            {pieza.descripcion && (
              <p className="text-slate-400 leading-relaxed">{pieza.descripcion}</p>
            )}
          </div>

          {/* Precio + acciones */}
          <div className="glass-card p-6 mb-8 space-y-6 border-white/20">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-slate-500 text-sm block mb-1">Precio cotizado</span>
                <div className="text-5xl font-black text-white">{formatPrice(pieza.precio)}</div>
              </div>
              <div className="text-right">
                <span className={cn(
                  'text-sm font-bold flex items-center justify-end gap-1 mb-1',
                  enStock ? 'text-emerald-500' : 'text-red-400'
                )}>
                  <CheckCircle2 className="w-4 h-4" />
                  {enStock ? 'Disponible' : 'Agotado'}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/solicitar', { state: { piezaId: pieza.id, nombre: pieza.nombre } })}
              className="btn-primary w-full h-14 flex items-center justify-center gap-3 text-lg font-bold"
            >
              <FileText className="w-6 h-6" />
              Solicitar Presupuesto
            </button>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                <Truck className="w-5 h-5 text-blue-400 shrink-0" />
                <div className="text-[11px]">
                  <p className="text-white font-bold">Envío Express</p>
                  <p className="text-slate-400">Recíbelo en 24-48h</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="text-[11px]">
                  <p className="text-white font-bold">Pieza Revisada</p>
                  <p className="text-slate-400">Garantía 1 año</p>
                </div>
              </div>
            </div>
          </div>

          {/* Detalles técnicos */}
          <div className="space-y-3">
            {[
              { label: 'Referencia',    value: pieza.codigoPieza },
              { label: 'Categoría',     value: pieza.categoria },
              { label: 'Stock mínimo',  value: `${pieza.stockMinimo} ud.` },
              ...(pieza.ubicacion ? [{ label: 'Ubicación', value: pieza.ubicacion }] : []),
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 glass rounded-xl border-white/5">
                <span className="text-slate-500 text-sm">{item.label}</span>
                <span className="text-white font-medium text-sm flex items-center gap-2">
                  {item.label === 'Ubicación' && <MapPin className="w-4 h-4 text-blue-400" />}
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Vehículos compatibles del inventario */}
      {inventario.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-blue-600 pl-4">
            Disponibilidad por Vehículo
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inventario.map((inv, i) => (
              <div key={i} className="glass-card p-5 flex items-center justify-between">
                <div>
                  <p className="text-white font-bold">Vehículo #{inv.id.idVehiculo}</p>
                  <p className="text-slate-500 text-xs mt-1">{inv.estadoPieza} · {inv.cantidad} ud.</p>
                </div>
                <span className="text-white font-mono font-bold">{formatPrice(inv.precioUnitario)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Relacionadas */}
      {relacionadas.length > 0 && (
        <section className="mt-20">
          <h2 className="text-3xl font-bold text-white mb-8">Piezas Relacionadas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relacionadas.map(p => <PiezaCard key={p.id} pieza={p} />)}
          </div>
        </section>
      )}
    </div>
  )
}
