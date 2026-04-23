import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import client from '../api/client'
import PiezaCard from '../components/PiezaCard'
import type { Pieza } from '../types'

const CATEGORIAS = [
  { value: '', label: 'Todas' },
  { value: 'motor', label: 'Motores' },
  { value: 'carroceria', label: 'Carrocería' },
  { value: 'interior', label: 'Interior' },
  { value: 'electronica', label: 'Electrónica' },
  { value: 'ruedas', label: 'Ruedas' },
  { value: 'otros', label: 'Otros' },
]
const PAGE = 12

export default function Catalogo() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [todas, setTodas] = useState<Pieza[]>([])
  const [piezas, setPiezas] = useState<Pieza[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(1)

  const [f, setF] = useState({
    q: searchParams.get('q') || '',
    categoria: searchParams.get('categoria') || '',
    precioMin: '', precioMax: '',
  })

  useEffect(() => {
    setLoading(true)
    client.get('/piezas').then(r => setTodas(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    setF(prev => ({ ...prev, q: searchParams.get('q') || '', categoria: searchParams.get('categoria') || '' }))
  }, [searchParams])

  const filtrar = useCallback((pg = 0) => {
    const r = todas.filter(p => {
      if (f.q && !p.nombre.toLowerCase().includes(f.q.toLowerCase()) && !p.codigoPieza.toLowerCase().includes(f.q.toLowerCase())) return false
      if (f.categoria && p.categoria !== f.categoria) return false
      if (f.precioMin && p.precio < Number(f.precioMin)) return false
      if (f.precioMax && p.precio > Number(f.precioMax)) return false
      return true
    })
    setTotal(Math.ceil(r.length / PAGE) || 1)
    setPiezas(r.slice(pg * PAGE, (pg + 1) * PAGE))
    setPage(pg)
  }, [todas, f])

  useEffect(() => { filtrar(0) }, [filtrar])

  const set = (key: string, val: string) => {
    setF(p => ({ ...p, [key]: val }))
    const np = new URLSearchParams(searchParams)
    val ? np.set(key, val) : np.delete(key)
    setSearchParams(np)
  }

  return (
    <div className="h-full flex gap-5">
      {/* Filtros lateral */}
      <aside className="w-52 shrink-0 space-y-4 hidden md:block">
        <div className="card overflow-hidden">
          <div className="card-header">
            <span className="card-title">Filtros</span>
            <button onClick={() => { setF({ q: '', categoria: '', precioMin: '', precioMax: '' }); setSearchParams({}) }}
              className="text-[10px] text-primary hover:underline font-bold uppercase">Limpiar</button>
          </div>
          <div className="p-3 space-y-4">
            {/* Buscar */}
            <div>
              <p className="text-label-caps mb-2">Búsqueda</p>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-on-surface-variant" />
                <input value={f.q} onChange={e => set('q', e.target.value)} placeholder="Buscar..."
                  className="w-full pl-7 pr-2 py-1.5 text-[12px] bg-surface-dim border border-outline-variant rounded outline-none focus:ring-1 focus:ring-primary" />
              </div>
            </div>

            {/* Categoría */}
            <div>
              <p className="text-label-caps mb-2">Categoría</p>
              <div className="space-y-0.5">
                {CATEGORIAS.map(c => (
                  <button key={c.value} onClick={() => set('categoria', c.value)}
                    className={`w-full text-left px-2 py-1.5 rounded-sm text-[12px] transition-colors ${f.categoria === c.value ? 'bg-surface-dim text-on-surface font-semibold' : 'text-on-surface-variant hover:bg-surface-dim/50'}`}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Precio */}
            <div>
              <p className="text-label-caps mb-2">Precio (€)</p>
              <div className="flex gap-2">
                {(['precioMin', 'precioMax'] as const).map((k, i) => (
                  <input key={k} type="number" placeholder={i === 0 ? 'Mín' : 'Máx'}
                    value={f[k]} onChange={e => setF(p => ({ ...p, [k]: e.target.value }))}
                    className="w-full py-1.5 px-2 text-[12px] bg-surface-dim border border-outline-variant rounded outline-none focus:ring-1 focus:ring-primary" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Grid */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        <div className="card overflow-hidden shrink-0">
          <div className="card-header">
            <span className="card-title">
              {f.categoria ? CATEGORIAS.find(c => c.value === f.categoria)?.label ?? 'Catálogo' : 'Catálogo General'} — {piezas.length} resultado{piezas.length !== 1 ? 's' : ''}
            </span>
            {total > 1 && <span className="text-[10px] text-on-surface-variant font-mono">PÁG. {page + 1}/{total}</span>}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card h-64 animate-pulse" />
              ))}
            </div>
          ) : piezas.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-label-caps mb-2">Sin resultados</p>
              <p className="text-body-sm">Ajusta los filtros o busca otro término</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-4">
                {piezas.map(p => <PiezaCard key={p.id} pieza={p} />)}
              </div>
              {total > 1 && (
                <div className="flex justify-center gap-1.5 pb-4">
                  <button disabled={page === 0} onClick={() => filtrar(page - 1)}
                    className="px-3 py-1.5 text-[11px] font-mono border border-outline-variant rounded disabled:opacity-40 hover:border-primary hover:text-primary transition-colors">
                    ← PREV
                  </button>
                  {Array.from({ length: total }, (_, i) => (
                    <button key={i} onClick={() => filtrar(i)}
                      className={`w-8 h-8 text-[11px] font-mono rounded transition-colors ${i === page ? 'bg-primary text-white' : 'border border-outline-variant hover:border-primary text-on-surface-variant'}`}>
                      {i + 1}
                    </button>
                  ))}
                  <button disabled={page >= total - 1} onClick={() => filtrar(page + 1)}
                    className="px-3 py-1.5 text-[11px] font-mono border border-outline-variant rounded disabled:opacity-40 hover:border-primary hover:text-primary transition-colors">
                    NEXT →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
