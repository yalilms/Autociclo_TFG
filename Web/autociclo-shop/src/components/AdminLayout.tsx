import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FileText, Wrench, Car, Users, LogOut, ChevronRight, ShieldCheck } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { cn } from '../lib/utils'

const NAV = [
  { to: '/admin',           label: 'Dashboard',    Icon: LayoutDashboard, end: true },
  { to: '/admin/solicitudes', label: 'Solicitudes',  Icon: FileText },
  { to: '/admin/piezas',    label: 'Piezas',        Icon: Wrench },
  { to: '/admin/vehiculos', label: 'Vehículos',     Icon: Car },
  { to: '/admin/usuarios',  label: 'Usuarios',      Icon: Users },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { usuario, logout } = useAuthStore()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex bg-bg-deep">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 glass border-r border-white/10 flex flex-col">
        {/* Brand */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center glow-violet shrink-0">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">Panel Admin</p>
              <p className="text-slate-500 text-xs truncate">{usuario?.nombre}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group',
                isActive
                  ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              )}
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-violet-400' : 'text-slate-500 group-hover:text-white')} />
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronRight className="w-3 h-3 text-violet-400" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <NavLink to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-500 hover:text-white hover:bg-white/5 transition-all">
            <img src="/logo.png" alt="AutoCiclo" className="w-4 h-4 object-contain" />
            Ir a la tienda
          </NavLink>
          <button
            onClick={() => { logout(); navigate('/login') }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
