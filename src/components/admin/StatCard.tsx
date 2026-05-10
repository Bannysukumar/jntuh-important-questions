export function StatCard({
  label,
  value,
  hint,
  accent = 'cyan',
}: {
  label: string
  value: string | number
  hint?: string
  accent?: 'cyan' | 'amber' | 'violet' | 'emerald'
}) {
  const ring =
    accent === 'amber'
      ? 'from-amber-500/20 to-orange-500/5'
      : accent === 'violet'
        ? 'from-violet-500/20 to-fuchsia-500/5'
        : accent === 'emerald'
          ? 'from-emerald-500/20 to-teal-500/5'
          : 'from-cyan-500/20 to-sky-500/5'

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${ring} p-5 shadow-lg shadow-black/20`}
    >
      <div className="absolute inset-0 bg-slate-950/40" />
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="mt-2 font-display text-3xl font-bold tabular-nums text-white">{value}</p>
        {hint ? <p className="mt-2 text-xs text-slate-500">{hint}</p> : null}
      </div>
    </div>
  )
}
