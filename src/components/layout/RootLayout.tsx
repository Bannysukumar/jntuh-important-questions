import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { PageRouteFallback } from '@/components/layout/PageRouteFallback'
import { GtagRouteListener } from '@/components/analytics/GtagRouteListener'
import { MicrosoftClarity } from '@/components/analytics/MicrosoftClarity'
import { AuthModal } from '@/components/auth/AuthModal'
import { AuthModalProvider } from '@/contexts/AuthModalContext'

export function RootLayout() {
  return (
    <AuthModalProvider>
      <GtagRouteListener />
      <MicrosoftClarity />
      <Suspense fallback={<PageRouteFallback />}>
        <Outlet />
      </Suspense>
      <AuthModal />
    </AuthModalProvider>
  )
}
