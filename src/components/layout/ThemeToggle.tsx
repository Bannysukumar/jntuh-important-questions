import { useTheme } from '@/contexts/ThemeContext'

export function ThemeToggle() {
  const { resolved, toggle } = useTheme()
  const isDark = resolved === 'dark'

  return (
    <button
      type="button"
      onClick={toggle}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 focus-visible:outline focus-visible:ring-2 focus-visible:ring-sky-500/40 dark:border-slate-600 dark:bg-slate-900 dark:text-amber-200 dark:shadow-none dark:hover:bg-slate-800 dark:hover:text-amber-100"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      {isDark ? (
        <svg className="h-[1.125rem] w-[1.125rem]" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path d="M12 18a6 6 0 100-12 6 6 0 000 12zM12 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm0 18a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM4.22 4.22a1 1 0 011.42 0l.7.7a1 1 0 11-1.42 1.42l-.7-.7a1 1 0 010-1.42zm12.14 12.14a1 1 0 011.42 0l.7.7a1 1 0 01-1.42 1.42l-.7-.7a1 1 0 010-1.42zM2 12a1 1 0 011-1h1a1 1 0 110 2H3a1 1 0 01-1-1zm17 0a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1zM4.22 19.78a1 1 0 010-1.42l.7-.7a1 1 0 111.42 1.42l-.7.7a1 1 0 01-1.42 0zM17.36 6.64a1 1 0 010-1.42l.7-.7a1 1 0 111.42 1.42l-.7.7a1 1 0 01-1.42 0z" />
        </svg>
      ) : (
        <svg className="h-[1.125rem] w-[1.125rem]" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path d="M21.64 13a1 1 0 00-1.05-.14 8.05 8.05 0 01-3.37.73 8.15 8.15 0 01-8.14-8.1 8.59 8.59 0 01.25-2A1 1 0 008 2.36 10.14 10.14 0 1017 21a1 1 0 001.17-.53 1 1 0 00-.53-1.47z" />
        </svg>
      )}
    </button>
  )
}
