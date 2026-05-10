/* eslint-disable react-refresh/only-export-components -- useAuth is co-located with AuthProvider */
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getFirebaseAuth, getFirebaseDb, isFirebaseConfigured } from '@/services/firebase/config'
import type { SignUpProfile } from '@/types/auth'

interface AuthContextValue {
  user: User | null
  loading: boolean
  isAdmin: boolean
  signInGoogle: () => Promise<void>
  signInEmail: (email: string, password: string) => Promise<void>
  signUpEmail: (email: string, password: string, profile: SignUpProfile) => Promise<void>
  sendPasswordReset: (email: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function checkAdmin(uid: string): Promise<boolean> {
  if (!isFirebaseConfigured()) return false
  try {
    const db = getFirebaseDb()
    const ref = doc(db, 'admins', uid)
    const snap = await getDoc(ref)
    return snap.exists()
  } catch {
    // Rules may deny admins read if not deployed; offline; or token not ready yet.
    return false
  }
}

/** True if `users/{uid}.role` is admin (case-insensitive), e.g. set in Firebase Console. */
async function userDocHasAdminRole(uid: string): Promise<boolean> {
  if (!isFirebaseConfigured()) return false
  try {
    const snap = await getDoc(doc(getFirebaseDb(), 'users', uid))
    if (!snap.exists()) return false
    const r = snap.data().role
    return typeof r === 'string' && r.toLowerCase() === 'admin'
  } catch {
    return false
  }
}

/**
 * When `admins/{uid}` exists, mirror `role: admin` into `users/{uid}`.
 * We never write `student` here — that was overwriting Console edits on every refresh.
 */
async function syncAdminRoleToUserDoc(uid: string, inAdminsCollection: boolean): Promise<void> {
  if (!isFirebaseConfigured() || !inAdminsCollection) return
  try {
    const db = getFirebaseDb()
    await setDoc(
      doc(db, 'users', uid),
      { role: 'admin', updatedAt: new Date().toISOString() },
      { merge: true },
    )
  } catch {
    /* ignore offline / rules mismatch / permission edge cases */
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(() => isFirebaseConfigured())
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (!isFirebaseConfigured()) return
    const auth = getFirebaseAuth()
    return onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        try {
          // Ensure ID token is available before Firestore security rules run.
          await auth.authStateReady()
          await u.getIdToken()
          const fromAdmins = await checkAdmin(u.uid)
          const fromUserDoc = await userDocHasAdminRole(u.uid)
          const admin = fromAdmins || fromUserDoc
          setIsAdmin(admin)
          await syncAdminRoleToUserDoc(u.uid, fromAdmins)
        } catch {
          setIsAdmin(false)
        }
      } else {
        setIsAdmin(false)
      }
      setLoading(false)
    })
  }, [])

  const signInGoogle = useCallback(async () => {
    if (!isFirebaseConfigured()) {
      window.alert('Firebase is not configured. Add VITE_FIREBASE_* keys to enable login.')
      return
    }
    const auth = getFirebaseAuth()
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
  }, [])

  const signInEmail = useCallback(async (email: string, password: string) => {
    if (!isFirebaseConfigured()) {
      window.alert('Firebase is not configured.')
      return
    }
    const auth = getFirebaseAuth()
    await signInWithEmailAndPassword(auth, email, password)
  }, [])

  const signUpEmail = useCallback(async (email: string, password: string, profile: SignUpProfile) => {
    if (!isFirebaseConfigured()) {
      window.alert('Firebase is not configured.')
      return
    }
    const auth = getFirebaseAuth()
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    const name = profile.displayName.trim()
    await updateProfile(cred.user, { displayName: name })
    await auth.authStateReady()
    await cred.user.getIdToken()

    const db = getFirebaseDb()
    const now = new Date().toISOString()
    const isAdminUser = await checkAdmin(cred.user.uid)
    await setDoc(doc(db, 'users', cred.user.uid), {
      uid: cred.user.uid,
      displayName: name,
      email: cred.user.email,
      photoURL: cred.user.photoURL ?? null,
      role: isAdminUser ? 'admin' : 'student',
      degree: profile.degree,
      degreeOther:
        profile.degree === 'other' ? (profile.degreeOther?.trim() || null) : null,
      rollNumber: profile.rollNumber.trim(),
      favoritesSubjectIds: [],
      favoritesQuestionIds: [],
      createdAt: now,
      updatedAt: now,
    })
  }, [])

  const sendPasswordReset = useCallback(async (email: string) => {
    if (!isFirebaseConfigured()) {
      window.alert('Firebase is not configured.')
      return
    }
    const auth = getFirebaseAuth()
    await sendPasswordResetEmail(auth, email)
  }, [])

  const signOut = useCallback(async () => {
    if (!isFirebaseConfigured()) return
    await firebaseSignOut(getFirebaseAuth())
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      isAdmin,
      signInGoogle,
      signInEmail,
      signUpEmail,
      sendPasswordReset,
      signOut,
    }),
    [user, loading, isAdmin, signInGoogle, signInEmail, signUpEmail, sendPasswordReset, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
