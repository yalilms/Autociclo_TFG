import { type ReactNode } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  LayoutGrid, History, Settings, Search, Bell, UserCircle,
  ShoppingCart, LogOut, ChevronRight, Cog, Car, Zap, Circle, Wrench
} from 'lucide-react'
import { useAuthStore } from './store/authStore'
import PrivateRoute from './components/PrivateRoute'
import Home from './pages/Home'
import Catalogo from './pages/Catalogo'
import DetallePieza from './pages/DetallePieza'
import Login from './pages/Login'
import Registro from './pages/Registro'
import SolicitarPresupuesto from './pages/SolicitarPresupuesto'
import MisSolicitudes from './pages/MisSolicitudes'

const CATEGORIAS = [
  { value: 'motor',        label: 'Motores',      icon: <Cog className="w-4 h-4" /> },
  { value: 'carroceria',   label: 'Carrocería',    icon: <Car className="w-4 h-4" /> },
  { value: 'electronica',  label: 'Electrónica',   icon: <Zap className="w-4 h-4" /> },
  { value: 'interior',     label: 'Interior',      icon: <Circle className="w-4 h-4" /> },
  { value: 'ruedas',       label: 'Ruedas y Llantas', icon: <Circle className="w-4 h-4" /> },
  { value: 'otros',        label: 'Otros',         icon: <Wrench className="w-4 h-4" /> },
]

function Shell() {
  const navigate = useNavigate()
  const location = useLocation()
  const { usuario, logout } = useAuthStore()

  const isPath = (p: string) => location.pathname === p
  const isCat  = (c: string) => new URLSearchParams(location.search).get('categoria') === c

  const currentLabel =
    isPath('/') ? 'INICIO' :
    isPath('/catalogo') ? 'CATÁLOGO' :
    isPath('/login') ? 'ACCESO' :
    isPath('/registro') ? 'REGISTRO' :
    isPath('/solicitar') ? 'SOLICITAR PRESUPUESTO' :
    isPath('/mis-solicitudes') ? 'MIS PEDIDOS' :
    location.pathname.startsWith('/catalogo/') ? 'DETALLE DE PIEZA' : 'AUTOCICLO'

  return (
    <div className="h-screen flex bg-background overflow-hidden text-on-background">

      {/* ── Sidebar iconos ── */}
      <aside className="w-16 bg-[#1A1C1E] flex flex-col items-center py-6 gap-4 shrink-0 z-50">
        <div className="text-white font-black text-xs tracking-tighter mb-2">AC</div>
        <SidebarIcon active={isPath('/')} onClick={() => navigate('/')} icon={<LayoutGrid className="w-5 h-5" />} title="Inicio" />
        <SidebarIcon active={isPath('/catalogo') || location.pathname.startsWith('/catalogo/')} onClick={() => navigate('/catalogo')} icon={<ShoppingCart className="w-5 h-5" />} title="Catálogo" />
        <SidebarIcon active={isPath('/mis-solicitudes')} onClick={() => usuario ? navigate('/mis-solicitudes') : navigate('/login')} icon={<History className="w-5 h-5" />} title="Mis pedidos" />
        <div className="mt-auto flex flex-col gap-3">
          {usuario
            ? <SidebarIcon onClick={() => { logout(); navigate('/login') }} icon={<LogOut className="w-5 h-5" />} title="Salir" />
            : <SidebarIcon active={isPath('/login')} onClick={() => navigate('/login')} icon={<UserCircle className="w-5 h-5" />} title="Entrar" />
          }
          <SidebarIcon icon={<Settings className="w-5 h-5" />} title="Ajustes" />
        </div>
      </aside>

      {/* ── Sub-nav ── */}
      <nav className="w-64 bg-surface border-r border-outline-variant flex flex-col py-6 shrink-0 hidden lg:flex overflow-y-auto">
        <div className="px-5 mb-6">
          <span className="text-[11px] font-black text-primary tracking-widest uppercase block">AUTOCICLO</span>
          <span className="text-[10px] text-on-surface-variant font-mono">Desguace Profesional · Granada</span>
        </div>

        <div className="px-2 space-y-0.5 mb-6">
          <NavItem active={isPath('/')}                 label="Resumen General"       onClick={() => navigate('/')} />
          <NavItem active={isPath('/catalogo')}         label="Catálogo de Piezas"    badge={''} onClick={() => navigate('/catalogo')} />
          <NavItem active={isPath('/solicitar')}        label="Solicitar Presupuesto" onClick={() => usuario ? navigate('/solicitar') : navigate('/login')} />
          <NavItem active={isPath('/mis-solicitudes')}  label="Mis Solicitudes"       onClick={() => usuario ? navigate('/mis-solicitudes') : navigate('/login')} />
        </div>

        <div className="mt-2 px-5 mb-3">
          <span className="text-label-caps">Filtros de Catálogo</span>
        </div>
        <div className="px-2 space-y-0.5 flex-1">
          {CATEGORIAS.map(cat => (
            <NavItem
              key={cat.value}
              label={cat.label}
              active={isCat(cat.value)}
              onClick={() => navigate(`/catalogo?categoria=${cat.value}`)}
            />
          ))}
        </div>

        {/* Usuario */}
        {usuario && (
          <div className="mx-4 mt-6 pt-4 border-t border-outline-variant">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-surface-dim border border-outline-variant flex items-center justify-center text-[10px] font-bold text-on-surface-variant">
                {usuario.nombre.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-[12px] font-semibold text-on-surface leading-none">{usuario.nombre.split(' ')[0]}</p>
                <p className="text-[10px] text-on-surface-variant font-mono">{usuario.rol}</p>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ── Área principal ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="h-14 bg-surface border-b border-outline-variant flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-body-md font-bold text-on-surface uppercase tracking-wider">{currentLabel}</h1>
            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold hidden sm:inline">EN VIVO</span>
          </div>
          <div className="flex items-center gap-5">
            <SearchBar />
            <div className="flex items-center gap-4 text-on-surface-variant">
              <Bell className="w-4 h-4 cursor-pointer hover:text-primary transition-colors" />
              {usuario
                ? <button onClick={() => { logout(); navigate('/login') }} className="flex items-center gap-1 text-[12px] hover:text-primary transition-colors font-mono">{usuario.nombre.split(' ')[0]} <LogOut className="w-3 h-3" /></button>
                : <button onClick={() => navigate('/login')} className="flex items-center gap-1 text-[12px] hover:text-primary transition-colors"><UserCircle className="w-4 h-4" /> Acceder</button>
              }
            </div>
          </div>
        </header>

        {/* Content con animación */}
        <main className="flex-1 overflow-y-auto p-5 bg-background">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname + location.search}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="h-full"
            >
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/catalogo" element={<Catalogo />} />
                <Route path="/catalogo/:id" element={<DetallePieza />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="/solicitar" element={<PrivateRoute><SolicitarPresupuesto /></PrivateRoute>} />
                <Route path="/mis-solicitudes" element={<PrivateRoute><MisSolicitudes /></PrivateRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* ── Mobile Bottom Nav flotante ── */}
      <nav className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#1A1C1E]/90 backdrop-blur-md rounded-full px-6 py-3 flex items-center gap-8 shadow-xl z-50 border border-white/10">
        <button onClick={() => navigate('/')} className={isPath('/') ? 'text-primary' : 'text-white/50'}><LayoutGrid className="w-5 h-5" /></button>
        <button onClick={() => navigate('/catalogo')} className={isPath('/catalogo') ? 'text-primary' : 'text-white/50'}><ShoppingCart className="w-5 h-5" /></button>
        <button onClick={() => usuario ? navigate('/mis-solicitudes') : navigate('/login')} className={isPath('/mis-solicitudes') ? 'text-primary' : 'text-white/50'}><History className="w-5 h-5" /></button>
      </nav>
    </div>
  )
}

function SearchBar() {
  const navigate = useNavigate()
  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const q = (e.target as HTMLInputElement).value.trim()
      if (q) navigate(`/catalogo?q=${encodeURIComponent(q)}`)
    }
  }
  return (
    <div className="relative hidden sm:block">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-3.5 h-3.5" />
      <input
        type="text"
        placeholder="Buscar pieza... (Enter)"
        onKeyDown={handleKey}
        className="bg-surface-dim border-none rounded py-1.5 pl-9 pr-4 text-[11px] w-56 focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/50"
      />
    </div>
  )
}

function SidebarIcon({ icon, active, onClick, title }: { icon: ReactNode; active?: boolean; onClick?: () => void; title?: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-8 h-8 rounded-md flex items-center justify-center cursor-pointer transition-all ${
        active ? 'bg-primary text-white shadow-lg' : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
      }`}
    >
      {icon}
    </button>
  )
}

function NavItem({ label, active, badge, onClick }: { label: string; active?: boolean; badge?: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-sm transition-all cursor-pointer text-left ${
        active ? 'bg-surface-dim text-on-surface' : 'text-on-surface-variant hover:bg-surface-dim/50'
      }`}
    >
      <span className="text-[12px] font-medium">{label}</span>
      <div className="flex items-center gap-1">
        {badge && <span className="bg-outline-variant/50 text-on-surface-variant text-[10px] px-1.5 py-0.5 rounded-sm font-bold">{badge}</span>}
        {active && <ChevronRight className="w-3 h-3 text-primary" />}
      </div>
    </button>
  )
}

function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="h-full flex items-center justify-center">
      <div className="card p-12 text-center max-w-sm">
        <p className="text-label-caps mb-2">ERROR 404</p>
        <p className="text-h2 mb-4">Página no encontrada</p>
        <button onClick={() => navigate('/')} className="text-[12px] text-primary hover:underline font-mono">← VOLVER AL INICIO</button>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  )
}
