import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import client from '../api/client'
import type { Pieza, InventarioPieza } from '../types'

export default function DetallePieza() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [pieza, setPieza] = useState<Pieza | null>(null)
  const [inventario, setInventario] = useState<InventarioPieza[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      client.get(`/piezas/${id}`),
      client.get(`/inventario/pieza/${id}`).catch(() => ({ data: [] })),
    ]).then(([pr, ir]) => {
      setPieza(pr.data)
      setInventario(ir.data as InventarioPieza[])
    }).catch(() => setError('No se pudo cargar la pieza.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="grid grid-cols-12 gap-5">
      <div className="col-span-8 card h-96 animate-pulse" />
      <div className="col-span-4 card h-96 animate-pulse" />
    </div>
  )

  if (error || !pieza) return (
    <div className="card p-12 text-center max-w-md mx-auto">
      <p className="text-label-caps mb-2 text-red-600">ERROR</p>
      <p className="text-body-sm mb-4">{error || 'Pieza no encontrada'}</p>
      <button onClick={() => navigate('/catalogo')} className="text-[12px] text-primary font-bold hover:underline uppercase">← VOLVER AL CATÁLOGO</button>
    </div>
  )

  const stockTotal = inventario.reduce((acc, i) => acc + i.cantidad, 0)

  return (
    <div className="h-full flex flex-col gap-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-body-sm">
        <button onClick={() => navigate('/catalogo')} className="hover:text-primary transition-colors">Catálogo</button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button onClick={() => navigate(`/catalogo?categoria=${pieza.categoria}`)} className="hover:text-primary transition-colors capitalize">{pieza.categoria}</button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-on-surface font-medium">{pieza.nombre}</span>
      </div>

      <div className="grid grid-cols-12 gap-5 flex-1 overflow-hidden">
        {/* Imagen + tabla — 8 cols */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-5 overflow-hidden">
          <div className="card flex-1 relative overflow-hidden min-h-64">
            {pieza.foto
              ? <img src={pieza.foto} alt={pieza.nombre} className="w-full h-full object-cover" />
              : <div className="w-full h-full bg-surface-dim flex items-center justify-center text-label-caps">{pieza.nombre}</div>
            }
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
              <div>
                <span className="text-label-caps text-white/70 mb-2 block">{pieza.categoria}</span>
                <h2 className="text-2xl font-bold text-white uppercase tracking-tight">{pieza.nombre}</h2>
              </div>
            </div>
          </div>

          {/* Tabla técnica */}
          <div className="card overflow-hidden">
            <div className="card-header">
              <span className="card-title">Matriz Técnica</span>
            </div>
            <table className="w-full text-left text-[12px] font-mono">
              <thead>
                <tr className="bg-surface-dim uppercase text-[10px] font-bold text-on-surface-variant">
                  <th className="px-4 py-2">Parámetro</th>
                  <th className="px-4 py-2">Valor</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['REFERENCIA',   pieza.codigoPieza],
                  ['CATEGORÍA',    pieza.categoria.toUpperCase()],
                  ['PRECIO',       `${pieza.precio.toFixed(2)} €`],
                  ['STOCK',        stockTotal > 0 ? `${stockTotal} UNIDADES DISPONIBLES` : 'AGOTADO'],
                  ['UBICACIÓN',    pieza.ubicacion || '—'],
                  ['STOCK MÍNIMO', `${pieza.stockMinimo} ud.`],
                  ...(pieza.descripcion ? [['DESCRIPCIÓN', pieza.descripcion]] : []),
                  ...inventario.map(inv => [`VEHÍCULO #${inv.id.idVehiculo}`, `${inv.cantidad} ud. · ${inv.estadoPieza} · ${Number(inv.precioUnitario).toFixed(2)} €`]),
                ].map(([k, v], i) => (
                  <tr key={i} className="hover:bg-surface-dim/30 transition-colors">
                    <td className="px-4 py-2.5 border-b border-surface-dim text-on-surface-variant">{k}</td>
                    <td className="px-4 py-2.5 border-b border-surface-dim text-on-surface">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Purchase card — 4 cols */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-5">
          <div className="card p-6 flex flex-col justify-center gap-6">
            <div>
              <span className="text-label-caps mb-1 block">Precio cotizado</span>
              <span className="text-4xl font-mono font-bold text-primary">{pieza.precio.toFixed(2)} €</span>
            </div>
            <div className={`flex items-center gap-2 text-[12px] font-bold px-3 py-2 rounded ${stockTotal > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              <span className="w-2 h-2 rounded-full bg-current inline-block" />
              {stockTotal > 0 ? `En Stock (${stockTotal} disponible${stockTotal > 1 ? 's' : ''})` : 'Sin Stock'}
            </div>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/solicitar', { state: { piezaId: pieza.id, nombre: pieza.nombre } })}
                className="w-full bg-primary text-white font-bold py-3 rounded hover:bg-blue-600 transition-colors uppercase tracking-widest text-[12px]"
              >
                Solicitar Presupuesto
              </button>
              <button
                onClick={() => navigate('/catalogo')}
                className="w-full border border-primary text-primary font-bold py-3 rounded hover:bg-primary-container transition-colors uppercase tracking-widest text-[12px]"
              >
                Volver al Catálogo
              </button>
            </div>
          </div>

          {/* Matriz de riesgo decorativa */}
          <div className="card flex-1 p-5">
            <span className="card-title mb-4 block">Índice de Calidad</span>
            <div className="grid grid-cols-4 gap-1 h-24">
              <div className="bg-red-500/20 border border-red-500/40 rounded-sm"></div>
              <div className="bg-red-500/10 rounded-sm"></div>
              <div className="bg-orange-500/10 rounded-sm"></div>
              <div className="bg-green-500/10 rounded-sm"></div>
              <div className="bg-red-500/10 rounded-sm"></div>
              <div className="bg-orange-500/20 border border-orange-400/40 rounded-sm flex items-center justify-center">
                <div className="w-2 h-2 bg-on-surface rounded-full"></div>
              </div>
              <div className="bg-green-500/10 rounded-sm"></div>
              <div className="bg-green-500/20 border border-green-500/40 rounded-sm"></div>
            </div>
            <div className="mt-3 text-[11px] text-on-surface-variant font-mono">CONFIANZA_PIEZA: 92%</div>
          </div>
        </div>
      </div>
    </div>
  )
}
