import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Search, ArrowRight, ShieldCheck, Truck, RefreshCcw, Sparkles } from 'lucide-react'
import { motion } from 'motion/react'
import { cn } from '../lib/utils'
import client from '../api/client'
import PiezaCard from '../components/PiezaCard'
import type { Pieza } from '../types'

const MARCAS = ['Audi', 'BMW', 'Citroën', 'Ford', 'Honda', 'Hyundai', 'Mercedes', 'Nissan', 'Opel', 'Peugeot', 'Renault', 'Seat', 'Toyota', 'Volkswagen']

const CATEGORIAS = [
  { value: 'motor',       label: 'Motores',    desc: 'Bloques, culatas, turbos' },
  { value: 'carroceria',  label: 'Carrocería', desc: 'Puertas, aletas, paragolpes' },
  { value: 'electronica', label: 'Electrónica',desc: 'ECU, sensores, faros' },
  { value: 'interior',    label: 'Interior',   desc: 'Tapicería, salpicadero' },
  { value: 'ruedas',      label: 'Ruedas',     desc: 'Llantas, neumáticos, frenos' },
  { value: 'otros',       label: 'Otros',      desc: 'Dirección, suspensión...' },
]

const FEATURES = [
  { icon: ShieldCheck, title: 'Calidad Garantizada',   desc: 'Todas las piezas son revisadas y probadas por técnicos antes de su envío.',  color: 'text-blue-500' },
  { icon: Truck,       title: 'Envío Rápido 24/48h',   desc: 'Gestionamos tu pedido de inmediato para que tu coche vuelva a rodar.',       color: 'text-emerald-500' },
  { icon: RefreshCcw,  title: '14 Días de Devolución', desc: 'Si no es la pieza que necesitas, tienes dos semanas para realizar el cambio.', color: 'text-violet-500' },
]

export default function Home() {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [marca, setMarca] = useState('')
  const [novedades, setNovedades] = useState<Pieza[]>([])

  useEffect(() => {
    client.get('/piezas').then(r => {
      const sorted = (r.data as Pieza[]).sort((a, b) => (b.idPieza ?? 0) - (a.idPieza ?? 0))
      setNovedades(sorted.slice(0, 6))
    }).catch(() => {})
  }, [])

  const buscar = (e: React.FormEvent) => {
    e.preventDefault()
    const p = new URLSearchParams()
    if (q) p.set('q', q)
    if (marca) p.set('marca', marca)
    navigate(`/catalogo?${p}`)
  }

  return (
    <div className="space-y-24 pb-20">

      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] animate-glow-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-125 h-125 bg-violet-600/10 rounded-full blur-[150px] animate-glow-pulse" style={{ animationDelay: '2s' }} />

        <div className="relative max-w-7xl mx-auto px-4 text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6 cursor-default">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Desguace Profesional · Granada</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
              Los Mejores Recambios para tu{' '}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-violet-500">Coche</span>
            </h1>
            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12">
              Piezas originales revisadas y garantizadas. Solicita presupuesto sin compromiso y recibe respuesta en menos de 24h.
            </p>

            {/* Buscador hero */}
            <form
              onSubmit={buscar}
              className="glass p-2 md:p-4 rounded-2xl md:rounded-3xl flex flex-col md:flex-row items-center gap-4 max-w-3xl mx-auto border-white/20 glow-blue"
            >
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                <input
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  placeholder="Nombre de pieza, referencia..."
                  className="w-full bg-transparent text-white py-3 pl-10 pr-4 rounded-xl focus:outline-none placeholder:text-slate-500"
                />
              </div>
              <div className="w-px h-8 bg-white/10 hidden md:block" />
              <div className="flex-1 w-full">
                <select
                  value={marca}
                  onChange={e => setMarca(e.target.value)}
                  className="w-full bg-transparent text-white py-3 px-4 rounded-xl focus:outline-none appearance-none cursor-pointer border border-transparent hover:border-white/10 transition-colors"
                >
                  <option value="" className="bg-bg-deep">Todas las marcas</option>
                  {MARCAS.map(m => <option key={m} value={m} className="bg-bg-deep">{m}</option>)}
                </select>
              </div>
              <button type="submit" className="btn-primary w-full md:w-auto flex items-center justify-center gap-2">
                <Search className="w-5 h-5" />
                Buscar Piezas
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="glass-card p-8 flex flex-col items-center text-center group"
            >
              <div className={cn('p-4 rounded-2xl bg-white/5 mb-6 transition-transform group-hover:scale-110', f.color)}>
                <f.icon className="w-10 h-10" />
              </div>
              <h3 className="text-white font-bold text-xl mb-3">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categorías */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Categorías</h2>
            <p className="text-slate-400">Encuentra exactamente lo que buscas por sección</p>
          </div>
          <Link to="/catalogo" className="text-blue-500 hover:text-blue-400 font-bold flex items-center gap-2 transition-colors">
            Ver todo <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {CATEGORIAS.map((cat, i) => (
            <motion.div
              key={cat.value}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              viewport={{ once: true }}
            >
              <Link
                to={`/catalogo?categoria=${cat.value}`}
                className="glass-card p-6 flex flex-col gap-2 hover:border-blue-500/50 hover:-translate-y-2 transition-all group"
              >
                <span className="text-white font-bold text-lg group-hover:text-blue-400 transition-colors">{cat.label}</span>
                <span className="text-slate-500 text-sm">{cat.desc}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Últimas novedades */}
      {novedades.length > 0 && (
        <section className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Últimas Piezas</h2>
              <p className="text-slate-400">Recién añadidas a nuestro inventario</p>
            </div>
            <Link to="/catalogo" className="text-blue-500 hover:text-blue-400 font-bold flex items-center gap-2 transition-colors">
              Ver catálogo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {novedades.map(p => <PiezaCard key={p.idPieza} pieza={p} />)}
          </div>
        </section>
      )}
    </div>
  )
}
