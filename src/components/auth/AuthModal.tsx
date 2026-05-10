import { useAuth } from '@/contexts/AuthContext'
import { useAuthModal } from '@/contexts/AuthModalContext'
import { getAuthErrorMessage } from '@/lib/authErrors'
import { SITE_NAME } from '@/lib/constants'
import type { UserDegree } from '@/types/models'
import { useCallback, useEffect, useId, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function AuthModal() {
  const { isOpen, view, returnTo, closeAuth, setView } = useAuthModal()
  const { signInGoogle, signInEmail, signUpEmail, sendPasswordReset } = useAuth()
  const navigate = useNavigate()
  const titleId = useId()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [degree, setDegree] = useState<UserDegree | ''>('')
  const [degreeOther, setDegreeOther] = useState('')
  const [rollNumber, setRollNumber] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const goAfterAuth = useCallback(() => {
    const dest = returnTo
    setEmail('')
    setPassword('')
    setConfirm('')
    setDisplayName('')
    setDegree('')
    setDegreeOther('')
    setRollNumber('')
    setError(null)
    setResetSent(false)
    closeAuth()
    if (dest) navigate(dest, { replace: true })
  }, [closeAuth, navigate, returnTo])

  const clearFormFeedback = () => {
    setError(null)
    setResetSent(false)
  }

  const resetSignupFields = () => {
    setDisplayName('')
    setDegree('')
    setDegreeOther('')
    setRollNumber('')
    setConfirm('')
  }

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAuth()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [isOpen, closeAuth])

  if (!isOpen) return null

  const onGoogle = () => {
    clearFormFeedback()
    setBusy(true)
    void signInGoogle()
      .then(() => goAfterAuth())
      .catch((e: unknown) => setError(getAuthErrorMessage(e)))
      .finally(() => setBusy(false))
  }

  const onSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    clearFormFeedback()
    setBusy(true)
    void signInEmail(email, password)
      .then(() => goAfterAuth())
      .catch((err: unknown) => setError(getAuthErrorMessage(err)))
      .finally(() => setBusy(false))
  }

  const onSignUp = (e: React.FormEvent) => {
    e.preventDefault()
    clearFormFeedback()
    const name = displayName.trim()
    if (name.length < 2) {
      setError('Please enter your full name (at least 2 characters).')
      return
    }
    if (!degree) {
      setError('Please select your degree.')
      return
    }
    if (degree === 'other' && degreeOther.trim().length < 2) {
      setError('Please specify your programme under Other.')
      return
    }
    const roll = rollNumber.trim()
    if (roll.length < 2) {
      setError('Please enter your roll number.')
      return
    }
    if (password.length < 6) {
      setError('Use at least 6 characters for your password.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setBusy(true)
    void signUpEmail(email, password, {
      displayName: name,
      degree,
      degreeOther: degree === 'other' ? degreeOther.trim() : undefined,
      rollNumber: roll,
    })
      .then(() => goAfterAuth())
      .catch((err: unknown) => setError(getAuthErrorMessage(err)))
      .finally(() => setBusy(false))
  }

  const onForgot = (e: React.FormEvent) => {
    e.preventDefault()
    clearFormFeedback()
    setBusy(true)
    void sendPasswordReset(email)
      .then(() => setResetSent(true))
      .catch((err: unknown) => setError(getAuthErrorMessage(err)))
      .finally(() => setBusy(false))
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center sm:p-6"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/65 backdrop-blur-[3px] transition-opacity dark:bg-slate-950/80"
        aria-label="Close"
        onClick={closeAuth}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex max-h-[min(92vh,780px)] w-full max-w-[440px] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] dark:border-slate-700/80 dark:bg-slate-900 dark:shadow-black/40"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1 shrink-0 bg-gradient-to-r from-sky-500 via-brand-600 to-violet-500" />

        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 pb-4 pt-5 dark:border-slate-800">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              {SITE_NAME}
            </p>
            <h2 id={titleId} className="font-display text-xl font-bold text-slate-900 dark:text-white">
              {view === 'login' && 'Welcome back'}
              {view === 'signup' && 'Create your account'}
              {view === 'forgot' && 'Reset password'}
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {view === 'login' && 'Sign in to comment and sync your favorites.'}
              {view === 'signup' && 'Join with email or Google in seconds.'}
              {view === 'forgot' && 'We’ll email you a reset link.'}
            </p>
          </div>
          <button
            type="button"
            onClick={closeAuth}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {view !== 'forgot' ? (
            <div className="mb-5 flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800/80">
              <button
                type="button"
                onClick={() => {
                  clearFormFeedback()
                  resetSignupFields()
                  setView('login')
                }}
                className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
                  view === 'login'
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => {
                  clearFormFeedback()
                  setView('signup')
                }}
                className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
                  view === 'signup'
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                Sign up
              </button>
            </div>
          ) : null}

          {view !== 'forgot' ? (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={onGoogle}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>

              <div className="my-5 flex items-center gap-3 text-xs font-medium text-slate-400">
                <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                or email
                <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
              </div>

              {view === 'login' ? (
                <form className="space-y-3" onSubmit={onSignIn}>
                  <div>
                    <label htmlFor="auth-email" className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                      Email
                    </label>
                    <input
                      id="auth-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none ring-sky-500/30 transition focus:ring-2 dark:border-slate-600 dark:bg-slate-950"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="auth-password" className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                      Password
                    </label>
                    <input
                      id="auth-password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none ring-sky-500/30 transition focus:ring-2 dark:border-slate-600 dark:bg-slate-950"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="text-xs font-semibold text-sky-600 hover:underline dark:text-sky-400"
                      onClick={() => {
                        clearFormFeedback()
                        setView('forgot')
                      }}
                    >
                      Forgot password?
                    </button>
                  </div>
                  {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full rounded-xl bg-gradient-to-r from-sky-600 to-brand-600 py-3 text-sm font-semibold text-white shadow-md transition hover:from-sky-500 hover:to-brand-500 disabled:opacity-60"
                  >
                    Sign in
                  </button>
                </form>
              ) : (
                <form className="space-y-3" onSubmit={onSignUp}>
                  <div>
                    <label htmlFor="su-name" className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                      Full name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="su-name"
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      autoComplete="name"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none ring-sky-500/30 transition focus:ring-2 dark:border-slate-600 dark:bg-slate-950"
                      placeholder="As on your ID card"
                    />
                  </div>
                  <fieldset className="space-y-2">
                    <legend className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                      Degree <span className="text-red-500">*</span>
                    </legend>
                    <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50/50 p-3 dark:border-slate-600 dark:bg-slate-950/50">
                      {(
                        [
                          { value: 'btech' as const, label: 'B. Tech' },
                          { value: 'bpharm' as const, label: 'B. Pharmacy' },
                          { value: 'other' as const, label: 'Other' },
                        ] as const
                      ).map((opt) => (
                        <label
                          key={opt.value}
                          className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-800 dark:text-slate-200"
                        >
                          <input
                            type="radio"
                            name="degree"
                            value={opt.value}
                            checked={degree === opt.value}
                            onChange={() => setDegree(opt.value)}
                            className="h-4 w-4 border-slate-300 text-sky-600 focus:ring-sky-500 dark:border-slate-600"
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  {degree === 'other' ? (
                    <div>
                      <label htmlFor="su-degree-other" className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                        Specify programme <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="su-degree-other"
                        type="text"
                        value={degreeOther}
                        onChange={(e) => setDegreeOther(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none ring-sky-500/30 transition focus:ring-2 dark:border-slate-600 dark:bg-slate-950"
                        placeholder="e.g. M. Tech, MCA, Diploma…"
                      />
                    </div>
                  ) : null}
                  <div>
                    <label htmlFor="su-roll" className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                      Roll number <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="su-roll"
                      type="text"
                      required
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      autoComplete="off"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none ring-sky-500/30 transition focus:ring-2 dark:border-slate-600 dark:bg-slate-950"
                      placeholder="University roll / registration no."
                    />
                  </div>
                  <div>
                    <label htmlFor="su-email" className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="su-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none ring-sky-500/30 transition focus:ring-2 dark:border-slate-600 dark:bg-slate-950"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="su-password" className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                      Password
                    </label>
                    <input
                      id="su-password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none ring-sky-500/30 transition focus:ring-2 dark:border-slate-600 dark:bg-slate-950"
                      placeholder="At least 6 characters"
                    />
                  </div>
                  <div>
                    <label htmlFor="su-confirm" className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                      Confirm password
                    </label>
                    <input
                      id="su-confirm"
                      type="password"
                      required
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none ring-sky-500/30 transition focus:ring-2 dark:border-slate-600 dark:bg-slate-950"
                      placeholder="Repeat password"
                    />
                  </div>
                  {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full rounded-xl bg-gradient-to-r from-sky-600 to-brand-600 py-3 text-sm font-semibold text-white shadow-md transition hover:from-sky-500 hover:to-brand-500 disabled:opacity-60"
                  >
                    Create account
                  </button>
                </form>
              )}
            </>
          ) : null}

          {view === 'forgot' ? (
            <form className="space-y-4 pt-1" onSubmit={onForgot}>
              <div>
                <label htmlFor="fg-email" className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                  Email
                </label>
                <input
                  id="fg-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none ring-sky-500/30 transition focus:ring-2 dark:border-slate-600 dark:bg-slate-950"
                  placeholder="you@example.com"
                />
              </div>
              {resetSent ? (
                <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                  Check your inbox for a reset link. You can close this window.
                </p>
              ) : null}
              {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
              <button
                type="submit"
                disabled={busy || resetSent}
                className="w-full rounded-xl bg-gradient-to-r from-sky-600 to-brand-600 py-3 text-sm font-semibold text-white shadow-md transition hover:from-sky-500 hover:to-brand-500 disabled:opacity-60"
              >
                Send reset link
              </button>
              <button
                type="button"
                className="w-full text-center text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                onClick={() => {
                  clearFormFeedback()
                  setView('login')
                }}
              >
                ← Back to sign in
              </button>
            </form>
          ) : null}
        </div>

        <p className="border-t border-slate-100 px-6 py-3 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          Secured with Firebase Authentication
        </p>
      </div>
    </div>
  )
}
