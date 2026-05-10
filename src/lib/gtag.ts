/** Must match the measurement ID in `index.html` (Google tag / gtag.js). */
export const GA_MEASUREMENT_ID = 'G-9396NXS3R9'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

/** Send a page view for client-side (React Router) navigations. Initial load is handled by gtag `config` in index.html. */
export function gtagPageView(pathWithSearch: string) {
  if (typeof window === 'undefined' || !window.gtag) return
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: pathWithSearch,
  })
}
