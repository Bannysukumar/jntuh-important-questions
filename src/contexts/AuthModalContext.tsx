/* eslint-disable react-refresh/only-export-components -- modal hook co-located with provider */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type AuthModalView = 'login' | 'signup' | 'forgot'

interface AuthModalContextValue {
  isOpen: boolean
  view: AuthModalView
  returnTo: string | null
  openAuth: (view?: AuthModalView, returnTo?: string | null) => void
  closeAuth: () => void
  setView: (v: AuthModalView) => void
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null)

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false)
  const [view, setView] = useState<AuthModalView>('login')
  const [returnTo, setReturnTo] = useState<string | null>(null)

  const openAuth = useCallback((v: AuthModalView = 'login', to?: string | null) => {
    setView(v)
    setReturnTo(to === undefined ? null : to)
    setOpen(true)
  }, [])

  const closeAuth = useCallback(() => {
    setOpen(false)
    setReturnTo(null)
    setView('login')
  }, [])

  const value = useMemo(
    () => ({ isOpen, view, returnTo, openAuth, closeAuth, setView }),
    [isOpen, view, returnTo, openAuth, closeAuth],
  )

  return <AuthModalContext.Provider value={value}>{children}</AuthModalContext.Provider>
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext)
  if (!ctx) throw new Error('useAuthModal must be used within AuthModalProvider')
  return ctx
}
