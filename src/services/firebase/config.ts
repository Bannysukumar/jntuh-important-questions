import { initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app'
import { getAnalytics, type Analytics } from 'firebase/analytics'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'

let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null
let storage: FirebaseStorage | null = null
let analytics: Analytics | null = null

function readEnv(key: string): string | undefined {
  const v = import.meta.env[key as keyof ImportMetaEnv] as string | undefined
  return v && v.length > 0 ? v : undefined
}

export function isFirebaseConfigured(): boolean {
  return Boolean(readEnv('VITE_FIREBASE_API_KEY'))
}

export function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase is not configured. Set VITE_FIREBASE_* variables in project root .env')
  }
  if (!app) {
    const options: FirebaseOptions = {
      apiKey: readEnv('VITE_FIREBASE_API_KEY'),
      authDomain: readEnv('VITE_FIREBASE_AUTH_DOMAIN'),
      projectId: readEnv('VITE_FIREBASE_PROJECT_ID'),
      storageBucket: readEnv('VITE_FIREBASE_STORAGE_BUCKET'),
      messagingSenderId: readEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
      appId: readEnv('VITE_FIREBASE_APP_ID'),
    }
    const databaseURL = readEnv('VITE_FIREBASE_DATABASE_URL')
    const measurementId = readEnv('VITE_FIREBASE_MEASUREMENT_ID')
    if (databaseURL) options.databaseURL = databaseURL
    if (measurementId) options.measurementId = measurementId
    app = initializeApp(options)
  }
  return app
}

/** Call once after app shell loads. No-op if Analytics is unavailable (e.g. some dev environments). */
export function initFirebaseAnalytics(): Analytics | null {
  if (!isFirebaseConfigured()) return null
  if (!readEnv('VITE_FIREBASE_MEASUREMENT_ID')) return null
  if (analytics) return analytics
  try {
    analytics = getAnalytics(getFirebaseApp())
    return analytics
  } catch {
    return null
  }
}

export function getFirebaseAuth(): Auth {
  if (!auth) auth = getAuth(getFirebaseApp())
  return auth
}

export function getFirebaseDb(): Firestore {
  if (!db) db = getFirestore(getFirebaseApp())
  return db
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!storage) storage = getStorage(getFirebaseApp())
  return storage
}
