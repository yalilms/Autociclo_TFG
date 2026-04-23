import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function Navbar() {
  const { usuario, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path: string) =>
    location.pathname === path
      ? 'text-blue-400 border-b-2 border-blue-400'
      : 'text-slate-400 hover:text-white'

  return (
    <nav
      style={{
        background: 'rgba(15, 23, 42, 0.95)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(12px)',
      }}
      className="sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
            >
              AC
            </div>
            <span className="text-white font-bold text-lg hidden sm:block">AutoCiclo</span>
            <span className="text-slate-400 text-xs hidden sm:block">Shop</span>
          </Link>

          {/* Links centrales */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className={`text-sm font-medium pb-1 transition-colors ${isActive('/')}`}>
              Inicio
            </Link>
            <Link to="/catalogo" className={`text-sm font-medium pb-1 transition-colors ${isActive('/catalogo')}`}>
              Catálogo
            </Link>
            {usuario && (
              <>
                <Link to="/solicitar" className={`text-sm font-medium pb-1 transition-colors ${isActive('/solicitar')}`}>
                  Solicitar Presupuesto
                </Link>
                <Link to="/mis-solicitudes" className={`text-sm font-medium pb-1 transition-colors ${isActive('/mis-solicitudes')}`}>
                  Mis Solicitudes
                </Link>
              </>
            )}
          </div>

          {/* Auth */}
          <div className="flex items-center gap-3">
            {usuario ? (
              <>
                <span className="text-slate-400 text-sm hidden sm:block">
                  Hola, <span className="text-white font-medium">{usuario.nombre.split(' ')[0]}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm px-3 py-1.5 rounded-lg border border-slate-600 text-slate-300 hover:text-white hover:border-slate-400 transition-colors"
                >
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm text-slate-300 hover:text-white transition-colors"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/registro"
                  className="text-sm px-4 py-1.5 rounded-lg text-white font-medium transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden flex gap-4 pb-3 overflow-x-auto">
          <Link to="/" className={`text-sm whitespace-nowrap ${isActive('/')}`}>Inicio</Link>
          <Link to="/catalogo" className={`text-sm whitespace-nowrap ${isActive('/catalogo')}`}>Catálogo</Link>
          {usuario && (
            <>
              <Link to="/solicitar" className={`text-sm whitespace-nowrap ${isActive('/solicitar')}`}>Solicitar</Link>
              <Link to="/mis-solicitudes" className={`text-sm whitespace-nowrap ${isActive('/mis-solicitudes')}`}>Mis Solicitudes</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
