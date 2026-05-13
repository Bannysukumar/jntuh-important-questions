/** Lightweight placeholder while lazy route chunks load (FCP / LCP). */
export function PageRouteFallback({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const isDark = variant === 'dark'
  return (
    <div
      className="flex min-h-[40vh] items-center justify-center px-4"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <div
          className={
            isDark
              ? 'h-8 w-8 shrink-0 animate-spin rounded-full border-2 border-cyan-400/40 border-t-cyan-300'
              : 'h-8 w-8 shrink-0 animate-spin rounded-full border-2 border-sky-500 border-t-transparent dark:border-sky-400'
          }
          aria-hidden
        />
        <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-500 dark:text-slate-400'}`}>
          Loading…
        </p>
      </div>
    </div>
  )
}
