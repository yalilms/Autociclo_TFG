import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

interface Props {
  children: React.ReactNode
}

export default function ClienteRoute({ children }: Props) {
  const { token, usuario } = useAuthStore()
  const location = useLocation()

  if (!token) return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />
  if (usuario?.rol === 'ADMIN' || usuario?.rol === 'EMPLEADO') return <Navigate to="/admin/solicitudes" replace />

  return <>{children}</>
}
