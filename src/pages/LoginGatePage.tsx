import { useAuthModal } from '@/contexts/AuthModalContext'
import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

/** Opens the auth modal and returns the user to the home shell. Preserves `next` for post-login redirect. */
export function LoginGatePage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { openAuth } = useAuthModal()
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true
    const next = params.get('next')
    openAuth('login', next === null ? null : next)
    navigate('/', { replace: true })
  }, [params, navigate, openAuth])

  return null
}
