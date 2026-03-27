import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

export function ProtectedRoute({ children }) {
  const { user } = useAuthStore()
  const location = useLocation()
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return children
}

export function AdminRoute({ children }) {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/" replace />
  return children
}

export function GuestRoute({ children }) {
  const { user } = useAuthStore()
  if (user) return <Navigate to="/" replace />
  return children
}
