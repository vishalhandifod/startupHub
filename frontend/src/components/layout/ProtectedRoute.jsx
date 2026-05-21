import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function ProtectedRoute({ children }) {
  const { token, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[rgb(var(--bg))]">
        <div className="glass-panel px-6 py-5 text-center">
          <p className="font-display text-2xl font-bold">StartupHub</p>
          <p className="mt-2 subtle-text">Loading your network...</p>
        </div>
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return children
}
