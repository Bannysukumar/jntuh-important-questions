/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Canonical origin (no trailing slash), e.g. https://jntuh-important-questions.vercel.app */
  readonly VITE_SITE_URL?: string
  readonly VITE_OG_IMAGE_URL?: string
  readonly VITE_GOOGLE_SITE_VERIFICATION?: string
  readonly VITE_FIREBASE_API_KEY?: string
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string
  readonly VITE_FIREBASE_DATABASE_URL?: string
  readonly VITE_FIREBASE_PROJECT_ID?: string
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string
  readonly VITE_FIREBASE_APP_ID?: string
  readonly VITE_FIREBASE_MEASUREMENT_ID?: string
  readonly VITE_RECAPTCHA_SITE_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
