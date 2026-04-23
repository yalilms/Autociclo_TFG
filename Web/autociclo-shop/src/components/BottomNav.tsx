import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { usuario } = useAuthStore()

  const isActive = (path: string) => location.pathname === path

  const items = [
    { to: '/',                label: 'Inicio',    icon: 'home' },
    { to: '/catalogo',        label: 'Catálogo',  icon: 'inventory_2' },
    ...(usuario ? [
      { to: '/solicitar',       label: 'Solicitar', icon: 'request_quote' },
      { to: '/mis-solicitudes', label: 'Pedidos',   icon: 'history' },
    ] : [
      { to: '/login',           label: 'Entrar',    icon: 'login' },
    ]),
  ]

  return (
    <nav
      className="fixed bottom-0 w-full z-50 flex justify-around items-center h-16 px-4 border-t md:hidden"
      style={{ background: '#000f1e', borderColor: '#1e3248' }}
    >
      {items.map(item => (
        <button
          key={item.to}
          onClick={() => navigate(item.to)}
          className="flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-lg transition-all active:scale-95 text-[10px] font-bold uppercase tracking-wider"
          style={
            isActive(item.to)
              ? { color: '#3398db', background: 'rgba(51,152,219,0.1)' }
              : { color: '#8e9196' }
          }
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: isActive(item.to) ? "'FILL' 1" : "'FILL' 0" }}
          >
            {item.icon}
          </span>
          {item.label}
        </button>
      ))}
    </nav>
  )
}
