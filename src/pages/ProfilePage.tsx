import { useQuery } from '@tanstack/react-query'
import { doc, getDoc } from 'firebase/firestore'
import { Link, Navigate } from 'react-router-dom'
import { SEOHead } from '@/components/seo/SEOHead'
import { useAuth } from '@/contexts/AuthContext'
import { getFirebaseDb, isFirebaseConfigured } from '@/services/firebase/config'
import { PROFILE_SEO_DESCRIPTION } from '@/lib/siteMessaging'
import type { UserDegree, UserRole } from '@/types/models'

const DEGREE_LABEL: Record<UserDegree, string> = {
  btech: 'B. Tech',
  bpharm: 'B. Pharmacy',
  other: 'Other',
}

export function ProfilePage() {
  const { user, loading, isAdmin } = useAuth()

  const { data: firestoreProfile } = useQuery({
    queryKey: ['userProfile', user?.uid],
    enabled: Boolean(user) && isFirebaseConfigured(),
    queryFn: async () => {
      if (!user) return null
      const snap = await getDoc(doc(getFirebaseDb(), 'users', user.uid))
      if (!snap.exists()) return null
      return snap.data() as {
        role?: UserRole
        degree?: UserDegree
        degreeOther?: string | null
        rollNumber?: string | null
      }
    },
  })

  if (loading) return <p className="text-slate-600">Loading…</p>
  if (!user) return <Navigate to="/login?next=/profile" replace />

  const degreeLine =
    firestoreProfile?.degree != null
      ? firestoreProfile.degree === 'other' && firestoreProfile.degreeOther
        ? `${DEGREE_LABEL.other}: ${firestoreProfile.degreeOther}`
        : DEGREE_LABEL[firestoreProfile.degree]
      : null

  /** Matches dashboard access: `admins/{uid}` or `users.role` admin in Firestore. */
  const accessRole: UserRole = isAdmin ? 'admin' : 'student'

  return (
    <>
      <SEOHead
        title="Profile"
        description={PROFILE_SEO_DESCRIPTION}
        canonicalPath="/profile"
        noindex
      />
      <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Profile</h1>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm text-slate-500">Signed in as</p>
        <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
          {user.displayName ?? 'Student'}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400">{user.email}</p>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          <span className="font-medium text-slate-700 dark:text-slate-300">Role:</span>{' '}
          <span className="capitalize">{accessRole}</span>
          {isAdmin ? (
            <span className="ml-2 rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
              Dashboard access
            </span>
          ) : null}
        </p>
        {firestoreProfile?.role && firestoreProfile.role !== accessRole ? (
          <p className="mt-1 text-xs text-amber-800 dark:text-amber-200/90">
            Your <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">users</code> doc lists
            role “{firestoreProfile.role}”, which does not match your current access level. See{' '}
            <Link to="/help" className="font-medium text-brand-600 underline">
              Help
            </Link>{' '}
            → admin FAQs.
          </p>
        ) : null}
        {degreeLine ? (
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            <span className="font-medium text-slate-700 dark:text-slate-300">Degree:</span> {degreeLine}
          </p>
        ) : null}
        {firestoreProfile?.rollNumber ? (
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            <span className="font-medium text-slate-700 dark:text-slate-300">Roll no.:</span>{' '}
            {firestoreProfile.rollNumber}
          </p>
        ) : null}
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          Use your account to save favorite units, join discussions on important questions, and submit live ratings after
          exams — helping every JNTUH B.Tech student prepare smarter. Features use Firebase when configured.
        </p>
        <Link to="/favorites" className="mt-4 inline-block text-sm font-semibold text-brand-600">
          View favorites →
        </Link>
      </div>
    </>
  )
}
