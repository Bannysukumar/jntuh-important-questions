import { Link } from 'react-router-dom'

export function Breadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-slate-600 dark:text-slate-400">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((it, i) => (
          <li key={`${it.label}-${i}`} className="flex items-center gap-1">
            {i > 0 ? <span className="text-slate-400">/</span> : null}
            {it.to ? (
              <Link to={it.to} className="hover:text-brand-600 dark:hover:text-sky-400">
                {it.label}
              </Link>
            ) : (
              <span className="font-medium text-slate-800 dark:text-slate-100">{it.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
