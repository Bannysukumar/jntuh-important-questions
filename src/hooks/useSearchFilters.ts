import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'

type Filters = { regulation: string; branch: string; semester: string }

function readFilters(params: URLSearchParams): Filters {
  return {
    regulation: params.get('regulation') ?? '',
    branch: params.get('branch') ?? '',
    semester: params.get('semester') ?? '',
  }
}

export function useSearchFilters() {
  const location = useLocation()
  const [params, setParams] = useSearchParams()
  const onSearchRoute = location.pathname.startsWith('/search')

  const fromUrl = useMemo(() => readFilters(params), [params])

  const [local, setLocal] = useState<Filters>({ regulation: '', branch: '', semester: '' })

  useEffect(() => {
    if (!onSearchRoute) return
    queueMicrotask(() => setLocal(fromUrl))
  }, [onSearchRoute, fromUrl])

  const regulation = onSearchRoute ? fromUrl.regulation : local.regulation
  const branch = onSearchRoute ? fromUrl.branch : local.branch
  const semester = onSearchRoute ? fromUrl.semester : local.semester

  const patchUrl = useCallback(
    (updates: Partial<Filters>) => {
      const next = new URLSearchParams(params)
      for (const [key, value] of Object.entries(updates) as [keyof Filters, string][]) {
        if (value) next.set(key, value)
        else next.delete(key)
      }
      setParams(next, { replace: true })
    },
    [params, setParams],
  )

  const setRegulation = useCallback(
    (v: string) => {
      if (onSearchRoute) patchUrl({ regulation: v })
      else setLocal((s) => ({ ...s, regulation: v }))
    },
    [onSearchRoute, patchUrl],
  )

  const setBranch = useCallback(
    (v: string) => {
      if (onSearchRoute) patchUrl({ branch: v })
      else setLocal((s) => ({ ...s, branch: v }))
    },
    [onSearchRoute, patchUrl],
  )

  const setSemester = useCallback(
    (v: string) => {
      if (onSearchRoute) patchUrl({ semester: v })
      else setLocal((s) => ({ ...s, semester: v }))
    },
    [onSearchRoute, patchUrl],
  )

  return { regulation, branch, semester, setRegulation, setBranch, setSemester }
}
