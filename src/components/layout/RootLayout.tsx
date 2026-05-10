import { Outlet } from 'react-router-dom'
import { AuthModal } from '@/components/auth/AuthModal'
import { AuthModalProvider } from '@/contexts/AuthModalContext'

export function RootLayout() {
  return (
    <AuthModalProvider>
      <Outlet />
      <AuthModal />
    </AuthModalProvider>
  )
}
