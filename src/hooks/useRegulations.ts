import { useQuery } from '@tanstack/react-query'
import { DEFAULT_REGULATIONS } from '@/lib/constants'
import { fetchPublicRegulations } from '@/services/adminApi'

/** Live regulations from `siteConfig/public` (public read). */
export function useRegulations() {
  const q = useQuery({
    queryKey: ['publicRegulations'],
    queryFn: fetchPublicRegulations,
    staleTime: 60_000,
  })
  return {
    regulations: q.data ?? DEFAULT_REGULATIONS,
    isLoading: q.isLoading,
    isFetching: q.isFetching,
  }
}
