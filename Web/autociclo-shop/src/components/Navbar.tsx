import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, History, User, Menu, X, LogOut, FileText, ShieldCheck } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { cn } from '../lib/utils'
import { motion, AnimatePresence } from 'motion/react'

const NAV_LINKS = [
  { name: 'Motor',       href: '/catalogo?categoria=motor' },
  { name: 'Carrocería',  href: '/catalogo?categoria=carroceria' },
  { name: 'Electrónica', href: '/catalogo?categoria=electronica' },
  { name: 'Interior',    href: '/catalogo?categoria=interior' },
  { name: 'Ruedas',      href: '/catalogo?categoria=ruedas' },
]

export default function Navbar() {
  const { usuario, logout } = useAuthStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/catalogo?q=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
      setIsMenuOpen(false)
    }
  }

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <img src="/logo.png" alt="AutoCiclo" className="w-10 h-10 object-cover rounded-full" />
            <span className="text-2xl font-bold tracking-tight text-white">
              Auto<span className="text-blue-500">Ciclo</span>
            </span>
          </Link>

          {/* Desktop Search */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-md mx-8 relative"
          >
            <input
              type="text"
              placeholder="Buscar piezas, referencias..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-500"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 pointer-events-none" />
          </form>

          {/* Desktop nav links + icons */}
          <div className="hidden md:flex items-center gap-5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-slate-300 hover:text-white transition-colors font-medium text-sm"
              >
                {link.name}
              </Link>
            ))}

            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-white/10">
              {usuario ? (
                <>
                  {usuario.rol === 'ADMIN' && (
                    <Link to="/admin" className="group" title="Panel de administración">
                      <ShieldCheck className="w-6 h-6 text-violet-400 group-hover:text-violet-300 transition-colors" />
                    </Link>
                  )}
                  {usuario.rol === 'CLIENTE' && (
                    <>
                      <Link to="/solicitar" className="group" title="Solicitar presupuesto">
                        <FileText className="w-6 h-6 text-slate-300 group-hover:text-white transition-colors" />
                      </Link>
                      <Link to="/mis-solicitudes" className="group" title="Mis solicitudes">
                        <History className="w-6 h-6 text-slate-300 group-hover:text-white transition-colors" />
                      </Link>
                    </>
                  )}
                  <button
                    onClick={() => { logout(); navigate('/login') }}
                    className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-white transition-colors"
                  >
                    <span className="text-xs text-slate-400">{usuario.nombre.split(' ')[0]}</span>
                    <LogOut className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <Link to="/login" className="group">
                  <User className="w-6 h-6 text-slate-300 group-hover:text-white transition-colors" />
                </Link>
              )}
            </div>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-white/10 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Buscar piezas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              </form>

              <div className="grid grid-cols-2 gap-3">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="p-4 glass-card text-center font-medium text-sm"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              <div className={cn(
                "pt-6 border-t border-white/10",
                usuario ? "grid grid-cols-3 gap-3" : "flex justify-around"
              )}>
                {usuario ? (
                  <>
                    {usuario.rol === 'ADMIN' && (
                      <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="flex flex-col items-center gap-1">
                        <ShieldCheck className="w-6 h-6 text-violet-400" />
                        <span className="text-xs text-slate-400">Admin</span>
                      </Link>
                    )}
                    {usuario.rol === 'CLIENTE' && (
                      <>
                        <Link to="/solicitar" onClick={() => setIsMenuOpen(false)} className="flex flex-col items-center gap-1">
                          <FileText className="w-6 h-6 text-blue-500" />
                          <span className="text-xs text-slate-400">Solicitar</span>
                        </Link>
                        <Link to="/mis-solicitudes" onClick={() => setIsMenuOpen(false)} className="flex flex-col items-center gap-1">
                          <History className="w-6 h-6 text-violet-500" />
                          <span className="text-xs text-slate-400">Solicitudes</span>
                        </Link>
                      </>
                    )}
                    <button onClick={() => { logout(); navigate('/login'); setIsMenuOpen(false) }} className="flex flex-col items-center gap-1">
                      <LogOut className="w-6 h-6 text-red-400" />
                      <span className="text-xs text-slate-400">Salir</span>
                    </button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className="flex flex-col items-center gap-1">
                    <User className="w-6 h-6 text-emerald-500" />
                    <span className="text-xs text-slate-400">Acceder</span>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
