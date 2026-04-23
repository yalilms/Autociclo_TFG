import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, TrendingUp, CheckCircle, Truck, Clock } from 'lucide-react'

const CATEGORIAS = [
  { value: 'motor',       label: 'Motores',      desc: 'Bloques, culatas, turbos' },
  { value: 'carroceria',  label: 'Carrocería',   desc: 'Puertas, aletas, paragolpes' },
  { value: 'electronica', label: 'Electrónica',  desc: 'ECU, sensores, faros' },
  { value: 'interior',    label: 'Interior',     desc: 'Tapicería, salpicadero' },
  { value: 'ruedas',      label: 'Ruedas',       desc: 'Llantas, neumáticos, frenos' },
  { value: 'otros',       label: 'Otros',        desc: 'Dirección, suspensión...' },
]

const MARCAS = ['Audi', 'BMW', 'Citroën', 'Ford', 'Honda', 'Hyundai', 'Mercedes', 'Nissan', 'Opel', 'Peugeot', 'Renault', 'Seat', 'Toyota', 'Volkswagen']

export default function Home() {
  const [q, setQ] = useState('')
  const [marca, setMarca] = useState('')
  const navigate = useNavigate()

  const buscar = (e: React.FormEvent) => {
    e.preventDefault()
    const p = new URLSearchParams()
    if (q) p.set('q', q)
    if (marca) p.set('marca', marca)
    navigate(`/catalogo?${p}`)
  }

  return (
    <div className="space-y-5">

      {/* Stats rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Piezas Disponibles', value: '4,821', trend: '+12 hoy', icon: <TrendingUp className="w-4 h-4" /> },
          { label: 'Vehículos en Patio', value: '127', trend: 'Activos', icon: <TrendingUp className="w-4 h-4" /> },
          { label: 'Solicitudes Abiertas', value: '38', trend: 'Pendientes', icon: <Clock className="w-4 h-4" /> },
          { label: 'Entregas este mes', value: '94', trend: '100% completadas', icon: <CheckCircle className="w-4 h-4" /> },
        ].map(stat => (
          <div key={stat.label} className="card p-4">
            <span className="text-label-caps">{stat.label}</span>
            <div className="text-2xl font-mono font-bold text-on-surface mt-1">{stat.value}</div>
            <div className="text-[11px] text-green-600 font-bold mt-0.5">{stat.trend}</div>
          </div>
        ))}
      </div>

      {/* Búsqueda principal */}
      <div className="card overflow-hidden">
        <div className="card-header">
          <span className="card-title">Búsqueda de Piezas</span>
          <span className="text-[10px] text-on-surface-variant font-mono">INVENTARIO EN TIEMPO REAL</span>
        </div>
        <div className="p-5">
          <form onSubmit={buscar} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Nombre de pieza, referencia, categoría..."
                className="w-full pl-9 pr-4 py-2 bg-surface-dim border border-outline-variant rounded text-sm focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <select
              value={marca}
              onChange={e => setMarca(e.target.value)}
              className="py-2 px-3 text-sm bg-surface-dim border border-outline-variant rounded focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="">Todas las marcas</option>
              {MARCAS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-white text-sm font-bold rounded hover:bg-blue-600 transition-colors uppercase tracking-widest"
            >
              Buscar
            </button>
          </form>
        </div>
      </div>

      {/* Categorías */}
      <div className="card overflow-hidden">
        <div className="card-header">
          <span className="card-title">Categorías del Catálogo</span>
        </div>
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {CATEGORIAS.map(cat => (
            <button
              key={cat.value}
              onClick={() => navigate(`/catalogo?categoria=${cat.value}`)}
              className="flex items-start gap-3 p-3 rounded bg-surface-dim border border-outline-variant hover:border-primary hover:bg-primary-container transition-all text-left group"
            >
              <div className="flex-1">
                <div className="text-[12px] font-bold text-on-surface group-hover:text-primary transition-colors">{cat.label}</div>
                <div className="text-[11px] text-on-surface-variant mt-0.5">{cat.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Info sistema */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card overflow-hidden">
          <div className="card-header">
            <span className="card-title">Estado del Sistema</span>
            <span className="text-[10px] text-on-surface-variant font-mono">NODO SINCRONIZADO</span>
          </div>
          <div className="p-4 bg-on-surface text-green-400 font-mono text-[11px] space-y-1 min-h-20">
            <div>[SISTEMA] Inventario sincronizado — 4,821 unidades activas</div>
            <div>[OK] Conexión API establecida — /api/piezas</div>
            <div>[OK] Autenticación JWT — AES-256 activo</div>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="card-header"><span className="card-title">Servicios</span></div>
          <div className="divide-y divide-surface-dim">
            {[
              { icon: <CheckCircle className="w-4 h-4 text-green-500" />, label: 'Piezas verificadas', desc: 'Control de calidad en cada pieza' },
              { icon: <Clock className="w-4 h-4 text-blue-500" />,        label: 'Respuesta en 24h',   desc: 'Presupuesto definitivo garantizado' },
              { icon: <Truck className="w-4 h-4 text-purple-500" />,      label: 'Envío España',       desc: 'O recogida en Granada' },
            ].map(s => (
              <div key={s.label} className="px-4 py-3 flex items-center gap-3">
                {s.icon}
                <div>
                  <p className="text-[12px] font-semibold text-on-surface">{s.label}</p>
                  <p className="text-[11px] text-on-surface-variant">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
