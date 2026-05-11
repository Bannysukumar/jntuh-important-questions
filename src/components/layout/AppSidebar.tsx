import { useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

const profileItem = {
  to: '/profile',
  label: 'Profile',
  end: false,
  icon: (
    <svg className="h-[1.125rem] w-[1.125rem] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  ),
}

const itemsBeforeProfile = [
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
    to: '/blog',
    label: 'Blog',
    end: false,
    icon: (
      <svg className="h-[1.125rem] w-[1.125rem] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
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
] as const

const ratingsItem = {
  to: '/ratings',
  label: 'Ratings',
  end: false,
  icon: (
    <svg className="h-[1.125rem] w-[1.125rem] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.049 2.927c.3-.921 1.603-.921 1.902l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      />
    </svg>
  ),
}

const itemsAfterProfile = [
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
  const { user } = useAuth()

  const items = useMemo(() => {
    if (user) {
      return [...itemsBeforeProfile, profileItem, ratingsItem, ...itemsAfterProfile] as const
    }
    return [...itemsBeforeProfile, ratingsItem, ...itemsAfterProfile] as const
  }, [user])

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
