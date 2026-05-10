import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { gtagPageView } from '@/lib/gtag'

export function GtagRouteListener() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    gtagPageView(`${pathname}${search}`)
  }, [pathname, search])

  return null
}
