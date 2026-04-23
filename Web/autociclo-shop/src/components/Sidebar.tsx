import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const CATEGORIAS = [
  { value: 'motor',      label: 'Motor',        icon: 'settings' },
  { value: 'carroceria', label: 'Carrocería',    icon: 'minor_crash' },
  { value: 'interior',   label: 'Interior',      icon: 'airline_seat_recline_normal' },
  { value: 'electronica',label: 'Electrónica',   icon: 'electrical_services' },
  { value: 'ruedas',     label: 'Ruedas',        icon: 'tire_repair' },
  { value: 'otros',      label: 'Otros',         icon: 'build' },
]

const NAV_ITEMS = (isLogged: boolean) => [
  { to: '/',                label: 'Inicio',            icon: 'home' },
  { to: '/catalogo',        label: 'Catálogo',          icon: 'inventory_2' },
  ...(isLogged ? [
    { to: '/solicitar',       label: 'Solicitar',         icon: 'request_quote' },
    { to: '/mis-solicitudes', label: 'Mis Solicitudes',   icon: 'history' },
  ] : []),
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { usuario } = useAuthStore()

  const isActive = (path: string) => location.pathname === path

  const irCategoria = (cat: string) => navigate(`/catalogo?categoria=${cat}`)

  const currentCat = new URLSearchParams(location.search).get('categoria') || ''

  return (
    <nav
      className="hidden lg:flex flex-col w-64 shrink-0 py-6 overflow-y-auto border-r"
      style={{ background: '#000f1e', borderColor: '#1e3248' }}
    >
      {/* Sección principal */}
      <div className="px-4 mb-6">
        <p className="text-xs font-bold uppercase tracking-widest mb-3 px-2" style={{ color: '#44474c' }}>
          Navegación
        </p>
        <div className="flex flex-col gap-0.5">
          {NAV_ITEMS(!!usuario).map(item => (
            <button
              key={item.to}
              onClick={() => navigate(item.to)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left"
              style={
                isActive(item.to)
                  ? { background: 'rgba(51,152,219,0.15)', color: '#92ccff' }
                  : { color: '#8e9196' }
              }
              onMouseEnter={e => {
                if (!isActive(item.to)) {
                  e.currentTarget.style.background = '#0e2132'
                  e.currentTarget.style.color = '#d1e4fb'
                }
              }}
              onMouseLeave={e => {
                if (!isActive(item.to)) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#8e9196'
                }
              }}
            >
              <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Divisor */}
      <div className="mx-4 mb-6" style={{ height: 1, background: '#1e3248' }} />

      {/* Catálogo por categoría */}
      <div className="px-4">
        <p className="text-xs font-bold uppercase tracking-widest mb-3 px-2" style={{ color: '#44474c' }}>
          Categorías
        </p>
        <div className="flex flex-col gap-0.5">
          {CATEGORIAS.map(cat => (
            <button
              key={cat.value}
              onClick={() => irCategoria(cat.value)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left"
              style={
                currentCat === cat.value
                  ? { background: 'rgba(51,152,219,0.15)', color: '#92ccff' }
                  : { color: '#8e9196' }
              }
              onMouseEnter={e => {
                if (currentCat !== cat.value) {
                  e.currentTarget.style.background = '#0e2132'
                  e.currentTarget.style.color = '#d1e4fb'
                }
              }}
              onMouseLeave={e => {
                if (currentCat !== cat.value) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#8e9196'
                }
              }}
            >
              <span className="material-symbols-outlined text-[18px]">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
