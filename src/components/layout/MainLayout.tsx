import { Suspense, useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { AppSidebar } from './AppSidebar'
import { StickySearchBar } from '../search/StickySearchBar'
import { ThemeToggle } from './ThemeToggle'
import { useAuth } from '../../contexts/AuthContext'
import { PageRouteFallback } from '@/components/layout/PageRouteFallback'
import { FOOTER_TAGLINE, SITE_SIDEBAR_TAGLINE } from '@/lib/siteMessaging'

export function MainLayout() {
  const { user, isAdmin, signOut } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    queueMicrotask(() => setSidebarOpen(false))
  }, [location.pathname])

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Ambient background */}
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden opacity-40 dark:opacity-30"
        aria-hidden
      >
        <div className="absolute -left-32 top-0 h-[420px] w-[420px] rounded-full bg-sky-200/50 blur-3xl dark:bg-sky-600/20" />
        <div className="absolute -right-24 top-1/3 h-[380px] w-[380px] rounded-full bg-indigo-200/40 blur-3xl dark:bg-indigo-600/15" />
        <div className="absolute bottom-0 left-1/3 h-[280px] w-[560px] rounded-full bg-slate-200/60 blur-3xl dark:bg-slate-700/20" />
      </div>

      {/* Mobile overlay */}
      <button
        type="button"
        aria-label="Close menu"
        className={`fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px] transition-opacity lg:hidden ${
          sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(18.5rem,88vw)] flex-col border-r border-slate-200/80 bg-white/95 shadow-xl shadow-slate-200/30 backdrop-blur-xl transition-transform duration-200 ease-out dark:border-slate-800/80 dark:bg-slate-950/95 dark:shadow-black/40 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-start justify-between gap-2 border-b border-slate-100 px-4 py-4 dark:border-slate-800/80">
          <Link to="/" className="group min-w-0" onClick={() => setSidebarOpen(false)}>
            <p className="font-display text-lg font-semibold leading-snug tracking-tight text-slate-900 transition-colors group-hover:text-sky-700 dark:text-white dark:group-hover:text-sky-300">
              JNTUH Important Questions
            </p>
            <p className="mt-1 text-[11px] font-medium leading-relaxed text-slate-500 dark:text-slate-400">
              Free · Paper analysis · Unit-wise PDFs
            </p>
          </Link>
          <button
            type="button"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <AppSidebar onNavigate={() => setSidebarOpen(false)} />
        </div>
        <div className="border-t border-slate-100 px-4 py-3 text-[11px] leading-relaxed text-slate-500 dark:border-slate-800/80 dark:text-slate-500">
          {SITE_SIDEBAR_TAGLINE}
        </div>
      </aside>

      <div className="relative z-10 flex min-h-screen flex-col lg:pl-[min(18.5rem,88vw)]">
        <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/75">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="hidden min-w-0 flex-1 sm:block lg:hidden">
              <p className="truncate font-display text-sm font-semibold text-slate-900 dark:text-white">JNTUH Important Questions</p>
            </div>

            <div className="ml-auto flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
              {user ? (
                <>
                  {isAdmin ? (
                    <Link
                      to="/admin"
                      className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-50 dark:text-sky-300 dark:hover:bg-sky-500/10 sm:text-sm"
                    >
                      Admin
                    </Link>
                  ) : null}
                  <Link
                    to="/profile"
                    className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 sm:text-sm"
                  >
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={() => void signOut()}
                    className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 sm:text-sm"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 sm:text-sm"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-sky-600/25 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400 sm:text-sm"
                  >
                    Create account
                  </Link>
                </>
              )}
              <ThemeToggle />
            </div>
          </div>
        </header>

        {location.pathname === '/search' ? <StickySearchBar /> : null}

        <main className="relative mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
          <Suspense fallback={<PageRouteFallback />}>
            <Outlet />
          </Suspense>
        </main>

        <footer className="relative border-t border-slate-200/80 bg-white/60 px-4 py-8 text-center text-xs text-slate-500 backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/40 dark:text-slate-500">
          <nav className="mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <Link to="/about" className="hover:text-slate-800 dark:hover:text-slate-300">
              About
            </Link>
            <span aria-hidden className="text-slate-300 dark:text-slate-600">
              ·
            </span>
            <Link to="/help" className="hover:text-slate-800 dark:hover:text-slate-300">
              Help
            </Link>
            <span aria-hidden className="text-slate-300 dark:text-slate-600">
              ·
            </span>
            <Link to="/ratings" className="hover:text-slate-800 dark:hover:text-slate-300">
              Ratings
            </Link>
            <span aria-hidden className="text-slate-300 dark:text-slate-600">
              ·
            </span>
            <Link to="/privacy" className="hover:text-slate-800 dark:hover:text-slate-300">
              Privacy
            </Link>
            <span aria-hidden className="text-slate-300 dark:text-slate-600">
              ·
            </span>
            <Link to="/terms" className="hover:text-slate-800 dark:hover:text-slate-300">
              Terms
            </Link>
            <span aria-hidden className="text-slate-300 dark:text-slate-600">
              ·
            </span>
            <Link to="/disclaimer" className="hover:text-slate-800 dark:hover:text-slate-300">
              Disclaimer
            </Link>
          </nav>
          <p className="mt-4 max-w-xl mx-auto leading-relaxed text-slate-600 dark:text-slate-400">
            © {new Date().getFullYear()} JNTUH Important Questions · {FOOTER_TAGLINE}
          </p>
        </footer>
      </div>
    </div>
  )
}
