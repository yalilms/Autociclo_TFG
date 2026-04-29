import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Filter, LayoutGrid, List, Search, X } from 'lucide-react'
import { cn } from '../lib/utils'
import { motion, AnimatePresence } from 'motion/react'
import client from '../api/client'
import PiezaCard from '../components/PiezaCard'
import type { Pieza } from '../types'

const CATEGORIAS = [
  { value: 'motor',       label: 'Motores' },
  { value: 'carroceria',  label: 'Carrocería' },
  { value: 'electronica', label: 'Electrónica' },
  { value: 'interior',    label: 'Interior' },
  { value: 'ruedas',      label: 'Ruedas' },
  { value: 'otros',       label: 'Otros' },
]

export default function Catalogo() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [todas, setTodas] = useState<Pieza[]>([])
  const [loading, setLoading] = useState(true)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const [activeCategoria, setActiveCategoria] = useState(searchParams.get('categoria') || '')
  const [searchQuery, setSearchQuery]         = useState(searchParams.get('q') || '')
  const [precioMax, setPrecioMax]             = useState(2000)

  useEffect(() => {
    client.get('/piezas').then(r => setTodas(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    setActiveCategoria(searchParams.get('categoria') || '')
    setSearchQuery(searchParams.get('q') || '')
  }, [searchParams])

  const filtradas = useMemo(() => {
    return todas.filter(p => {
      const matchQ   = !searchQuery  || p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || p.codigoPieza.toLowerCase().includes(searchQuery.toLowerCase())
      const matchCat = !activeCategoria || p.categoria === activeCategoria
      const matchPrecio = p.precio <= precioMax
      return matchQ && matchCat && matchPrecio
    })
  }, [todas, searchQuery, activeCategoria, precioMax])

  const resetFiltros = () => {
    setActiveCategoria('')
    setSearchQuery('')
    setPrecioMax(2000)
    setSearchParams({})
  }

  const setParam = (key: string, val: string) => {
    const np = new URLSearchParams(searchParams)
    val ? np.set(key, val) : np.delete(key)
    setSearchParams(np)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-12">

        {/* Sidebar filtros */}
        <aside className={cn(
          'lg:w-72 space-y-8 lg:sticky lg:top-32 h-fit glass p-6 rounded-2xl shadow-xl',
          !isFilterOpen ? 'hidden lg:block' : 'fixed inset-y-0 left-0 z-60 w-full max-w-xs bg-bg-deep p-8 overflow-y-auto'
        )}>
          <div className="flex items-center justify-between lg:hidden mb-6">
            <h2 className="text-xl font-bold text-white">Filtros</h2>
            <button onClick={() => setIsFilterOpen(false)}><X className="text-slate-400" /></button>
          </div>

          <div className="space-y-8">
            {/* Buscar */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Búsqueda</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setParam('q', e.target.value) }}
                  placeholder="Nombre o referencia..."
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 pl-9 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Categoría */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Categoría</h3>
              <div className="space-y-2">
                {CATEGORIAS.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => {
                      const next = cat.value === activeCategoria ? '' : cat.value
                      setActiveCategoria(next)
                      setParam('categoria', next)
                    }}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                      activeCategoria === cat.value ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:bg-white/5'
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Precio */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Precio máximo</h3>
              <div className="px-2">
                <input
                  type="range" min="0" max="2000" step="50"
                  value={precioMax}
                  onChange={e => setPrecioMax(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
                <div className="flex justify-between mt-2 text-xs text-slate-400 font-mono">
                  <span>0 €</span>
                  <span>{precioMax} €</span>
                </div>
              </div>
            </div>

            <button
              onClick={resetFiltros}
              className="w-full py-3 rounded-xl border border-white/10 text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              Restablecer Filtros
            </button>
          </div>
        </aside>

        {/* Contenido */}
        <main className="flex-1">
          {/* Top bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
            <div>
              <h1 className="text-3xl font-black text-white mb-2">
                {activeCategoria
                  ? CATEGORIAS.find(c => c.value === activeCategoria)?.label ?? 'Catálogo'
                  : searchQuery ? `Resultados para "${searchQuery}"` : 'Catálogo Completo'
                }
              </h1>
              <p className="text-slate-400 text-sm">{filtradas.length} piezas encontradas</p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 glass rounded-xl border-white/10 text-sm text-white"
              >
                <Filter className="w-4 h-4" /> Filtros
              </button>

              <div className="flex bg-slate-900 rounded-xl p-1 border border-white/10">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn('p-2 rounded-lg transition-all', viewMode === 'grid' ? 'bg-slate-800 text-white' : 'text-slate-500')}
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn('p-2 rounded-lg transition-all', viewMode === 'list' ? 'bg-slate-800 text-white' : 'text-slate-500')}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Grid / lista */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="glass-card h-64 animate-pulse" />
              ))}
            </div>
          ) : filtradas.length > 0 ? (
            <div className={cn('grid gap-8', viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1')}>
              {filtradas.map(p => <PiezaCard key={p.id} pieza={p} />)}
            </div>
          ) : (
            <div className="glass-card p-20 text-center flex flex-col items-center gap-6">
              <Search className="w-16 h-16 text-slate-700" />
              <div>
                <h3 className="text-xl font-bold text-white mb-2">No hay resultados</h3>
                <p className="text-slate-400">Intenta ajustar los filtros de búsqueda</p>
              </div>
              <button onClick={resetFiltros} className="btn-secondary">Limpiar todo</button>
            </div>
          )}
        </main>
      </div>

      {/* Backdrop móvil */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 lg:hidden"
            onClick={() => setIsFilterOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
