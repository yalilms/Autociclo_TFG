import { Link, useNavigate } from 'react-router-dom'
import { FileText, CheckCircle2, Tag } from 'lucide-react'
import { cn, formatPrice } from '../lib/utils'
import type { Pieza } from '../types'
import { motion } from 'motion/react'

interface Props {
  pieza: Pieza
  cantidad?: number
}

export default function PiezaCard({ pieza, cantidad }: Props) {
  const navigate = useNavigate()
  const disponible = cantidad !== undefined ? cantidad > 0 : true

  const categoriaColor: Record<string, string> = {
    motor:      'bg-orange-500/80',
    carroceria: 'bg-blue-500/80',
    electronica:'bg-violet-500/80',
    interior:   'bg-emerald-500/80',
    ruedas:     'bg-slate-500/80',
    otros:      'bg-pink-500/80',
  }

  const badgeCls = categoriaColor[pieza.categoria] ?? 'bg-slate-600/80'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-card group overflow-hidden flex flex-col h-full"
    >
      {/* Image */}
      <div className="relative aspect-4/3 overflow-hidden bg-slate-800/50">
        <Link to={`/catalogo/${pieza.id}`}>
          {pieza.foto ? (
            <img
              src={pieza.foto}
              alt={pieza.nombre}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-600">
              <Tag className="w-10 h-10 opacity-30" />
              <span className="text-xs font-mono uppercase tracking-wider opacity-40">{pieza.codigoPieza}</span>
            </div>
          )}
        </Link>

        {/* Category badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <span className={cn('text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider text-white', badgeCls)}>
            {pieza.categoria}
          </span>
        </div>

        {/* Stock badge */}
        <div className={cn(
          'absolute top-3 right-3 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider',
          disponible ? 'bg-emerald-500/80 text-white' : 'bg-red-500/80 text-white'
        )}>
          {disponible ? 'En stock' : 'Agotado'}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] uppercase tracking-widest text-blue-500 font-bold font-mono">
            {pieza.codigoPieza}
          </span>
        </div>

        <Link to={`/catalogo/${pieza.id}`} className="hover:text-blue-400 transition-colors">
          <h3 className="text-white font-bold text-lg mb-2 line-clamp-2 leading-tight">
            {pieza.nombre}
          </h3>
        </Link>

        {pieza.descripcion && (
          <p className="text-slate-400 text-xs mb-4 line-clamp-2 leading-relaxed">
            {pieza.descripcion}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-white">{formatPrice(pieza.precio)}</span>
            <span className="text-[10px] text-emerald-500 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {disponible ? `Stock mín. ${pieza.stockMinimo}` : 'Sin stock'}
            </span>
          </div>

          <button
            onClick={() => navigate('/solicitar', { state: { piezaId: pieza.id, nombre: pieza.nombre } })}
            className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white hover:bg-blue-500 transition-all active:scale-90 glow-blue"
            title="Solicitar presupuesto"
          >
            <FileText className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
