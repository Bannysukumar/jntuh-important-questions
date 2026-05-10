import { NavLink } from 'react-router-dom'

const items = [
  {
    to: '/',
    label: 'Home',
    end: true,
    icon: (
      <svg className="h-[1.125rem] w-[1.125rem] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    to: '/search',
    label: 'Browse',
    end: false,
    icon: (
      <svg className="h-[1.125rem] w-[1.125rem] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    to: '/favorites',
    label: 'Favorites',
    end: false,
    icon: (
      <svg className="h-[1.125rem] w-[1.125rem] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    to: '/about',
    label: 'About',
    end: false,
    icon: (
      <svg className="h-[1.125rem] w-[1.125rem] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    to: '/help',
    label: 'Help center',
    end: false,
    icon: (
      <svg className="h-[1.125rem] w-[1.125rem] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
] as const

function navClassName({ isActive }: { isActive: boolean }) {
  return [
    'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150',
    isActive
      ? 'bg-sky-50 text-sky-900 dark:bg-sky-500/15 dark:text-sky-100'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100',
  ].join(' ')
}

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-0.5 px-3 pb-4 pt-3" aria-label="Main">
      <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
        Navigation
      </p>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={navClassName}
          onClick={() => onNavigate?.()}
        >
          {({ isActive }) => (
            <>
              {isActive ? (
                <span
                  className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-full bg-sky-500 dark:bg-sky-400"
                  aria-hidden
                />
              ) : null}
              <span
                className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                  isActive
                    ? 'bg-white text-sky-600 shadow-sm dark:bg-slate-900/80 dark:text-sky-400'
                    : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700 dark:bg-slate-800/50 dark:text-slate-400 dark:group-hover:bg-slate-800 dark:group-hover:text-slate-200'
                }`}
              >
                {item.icon}
              </span>
              <span className="relative">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
