import { Outlet } from 'react-router-dom'
import { GtagRouteListener } from '@/components/analytics/GtagRouteListener'
import { MicrosoftClarity } from '@/components/analytics/MicrosoftClarity'
import { AuthModal } from '@/components/auth/AuthModal'
import { AuthModalProvider } from '@/contexts/AuthModalContext'

export function RootLayout() {
  return (
    <AuthModalProvider>
      <GtagRouteListener />
      <MicrosoftClarity />
      <Outlet />
      <AuthModal />
    </AuthModalProvider>
  )
}
