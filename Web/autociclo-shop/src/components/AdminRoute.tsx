import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

interface Props { children: React.ReactNode }

export default function AdminRoute({ children }: Props) {
  const { token, usuario } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  if (usuario?.rol !== 'ADMIN') return <Navigate to="/" replace />
  return <>{children}</>
}
