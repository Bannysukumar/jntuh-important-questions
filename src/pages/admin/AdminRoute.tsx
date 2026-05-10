import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export function AdminRoute({ children }: { children: ReactNode }) {
  const { user, loading, isAdmin } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
        Checking access…
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login?next=/admin" replace />
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}
