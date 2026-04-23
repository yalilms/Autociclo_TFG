import { Link } from 'react-router-dom'
import type { Pieza } from '../types'

interface Props { pieza: Pieza; cantidad?: number }

export default function PiezaCard({ pieza, cantidad }: Props) {
  const disponible = cantidad !== undefined ? cantidad > 0 : true

  return (
    <Link to={`/catalogo/${pieza.id}`} className="block">
      <div className="card group cursor-pointer hover:border-primary transition-all overflow-hidden flex flex-col">
        {/* Imagen */}
        <div className="h-40 overflow-hidden relative bg-surface-dim">
          {pieza.foto
            ? <img src={pieza.foto} alt={pieza.nombre} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300" />
            : <div className="w-full h-full flex items-center justify-center text-outline-variant text-[11px] font-mono uppercase tracking-widest">Sin imagen</div>
          }
          <div className="absolute top-2 right-2 bg-surface/90 px-2 py-0.5 rounded-sm border border-outline-variant text-[10px] font-bold font-mono">
            #{pieza.codigoPieza}
          </div>
          <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-sm text-[10px] font-bold ${disponible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {disponible ? 'EN STOCK' : 'AGOTADO'}
          </div>
        </div>

        {/* Info */}
        <div className="p-4 flex flex-col flex-1">
          <span className="text-label-caps mb-1">{pieza.categoria}</span>
          <h3 className="text-[13px] font-bold text-on-surface mb-2 line-clamp-2">{pieza.nombre}</h3>
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-surface-dim">
            <span className="text-data-tabular font-bold text-primary">{pieza.precio.toFixed(2)} €</span>
            <button className="text-[11px] font-bold text-primary hover:underline uppercase tracking-wider">Ver Datos</button>
          </div>
        </div>
      </div>
    </Link>
  )
}
