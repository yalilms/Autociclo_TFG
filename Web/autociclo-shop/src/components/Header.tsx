import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function Header() {
  const { usuario, logout } = useAuthStore()
  const navigate = useNavigate()
  const [busqueda, setBusqueda] = useState('')

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault()
    if (busqueda.trim()) navigate(`/catalogo?q=${encodeURIComponent(busqueda)}`)
  }

  return (
    <header
      className="sticky top-0 z-50 hidden md:flex items-center justify-between w-full px-6 py-3 border-b"
      style={{
        background: 'rgba(2,15,30,0.97)',
        backdropFilter: 'blur(12px)',
        borderColor: '#1e3248',
      }}
    >
      {/* Logo + Search */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => navigate('/')}
          className="text-lg font-black tracking-tighter"
          style={{ color: '#3398db' }}
        >
          AutoCiclo
        </button>

        <form onSubmit={handleBuscar} className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#8e9196' }}>
            search
          </span>
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar pieza, referencia o categoría..."
            className="py-2 pl-9 pr-4 w-80 text-sm rounded-full outline-none transition-colors focus:ring-1"
            style={{
              background: '#192b3d',
              border: '1px solid #44474c',
              color: '#d1e4fb',
            }}
            onFocus={e => (e.target.style.borderColor = '#3398db')}
            onBlur={e => (e.target.style.borderColor = '#44474c')}
          />
        </form>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {usuario ? (
          <>
            <span className="text-sm" style={{ color: '#c4c6cc' }}>
              {usuario.nombre.split(' ')[0]}
            </span>
            <button
              onClick={() => navigate('/mis-solicitudes')}
              className="material-symbols-outlined transition-colors"
              style={{ color: '#8e9196' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#92ccff')}
              onMouseLeave={e => (e.currentTarget.style.color = '#8e9196')}
              title="Mis solicitudes"
            >
              history
            </button>
            <button
              onClick={() => { logout(); navigate('/login') }}
              className="material-symbols-outlined transition-colors"
              style={{ color: '#8e9196' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#92ccff')}
              onMouseLeave={e => (e.currentTarget.style.color = '#8e9196')}
              title="Cerrar sesión"
            >
              logout
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate('/login')}
              className="text-sm font-medium transition-colors"
              style={{ color: '#8e9196' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#92ccff')}
              onMouseLeave={e => (e.currentTarget.style.color = '#8e9196')}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => navigate('/registro')}
              className="text-sm font-semibold px-4 py-1.5 rounded-lg transition-all"
              style={{ background: '#3398db', color: '#fff' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#92ccff')}
              onMouseLeave={e => (e.currentTarget.style.background = '#3398db')}
            >
              Registrarse
            </button>
          </>
        )}
        <span className="material-symbols-outlined" style={{ color: '#8e9196', cursor: 'default' }}>
          account_circle
        </span>
      </div>
    </header>
  )
}
