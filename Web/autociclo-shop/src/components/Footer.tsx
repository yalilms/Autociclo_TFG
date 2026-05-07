import { Link } from 'react-router-dom'
import { Share2, MessageSquare, Globe, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="glass border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="AutoCiclo" className="w-10 h-10 object-cover rounded-full" />
              <span className="text-2xl font-bold tracking-tight text-white">
                Auto<span className="text-blue-500">Ciclo</span>
              </span>
            </Link>
            <p className="text-slate-400 leading-relaxed text-sm">
              Desguace profesional especializado en piezas de segunda mano revisadas y garantizadas. Tu coche de vuelta en marcha.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-8 h-8 rounded-lg glass flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Globe className="w-4 h-4 text-white" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg glass flex items-center justify-center hover:bg-pink-600 transition-colors">
                <MessageSquare className="w-4 h-4 text-white" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg glass flex items-center justify-center hover:bg-blue-400 transition-colors">
                <Share2 className="w-4 h-4 text-white" />
              </a>
            </div>
          </div>

          {/* Explorar */}
          <div>
            <h4 className="text-white font-bold mb-6">Explorar</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><Link to="/catalogo" className="hover:text-blue-500 transition-colors">Catálogo de Piezas</Link></li>
              <li><Link to="/catalogo?categoria=motor" className="hover:text-blue-500 transition-colors">Motores y Mecánica</Link></li>
              <li><Link to="/catalogo?categoria=carroceria" className="hover:text-blue-500 transition-colors">Carrocería</Link></li>
              <li><Link to="/catalogo?categoria=electronica" className="hover:text-blue-500 transition-colors">Electrónica</Link></li>
            </ul>
          </div>

          {/* Clientes */}
          <div>
            <h4 className="text-white font-bold mb-6">Clientes</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><Link to="/solicitar" className="hover:text-blue-500 transition-colors">Solicitar Presupuesto</Link></li>
              <li><Link to="/mis-solicitudes" className="hover:text-blue-500 transition-colors">Mis Solicitudes</Link></li>
              <li><Link to="/registro" className="hover:text-blue-500 transition-colors">Crear Cuenta</Link></li>
              <li><Link to="/login" className="hover:text-blue-500 transition-colors">Iniciar Sesión</Link></li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-white font-bold mb-6">Contacto</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <span>Polígono Industrial, Nave 12, 18010 Granada</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-500 shrink-0" />
                <span>+34 958 123 456</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-500 shrink-0" />
                <span>info@autociclo.es</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© 2025 AutoCiclo Desguace Profesional · Granada. Todos los derechos reservados.</p>
          <p className="font-mono">TFG · IES P. Hermenegildo Lanz · 2º DAM</p>
        </div>
      </div>
    </footer>
  )
}
