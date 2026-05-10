import { Outlet } from 'react-router-dom'
import { GtagRouteListener } from '@/components/analytics/GtagRouteListener'
import { AuthModal } from '@/components/auth/AuthModal'
import { AuthModalProvider } from '@/contexts/AuthModalContext'

export function RootLayout() {
  return (
    <AuthModalProvider>
      <GtagRouteListener />
      <Outlet />
      <AuthModal />
    </AuthModalProvider>
  )
}
