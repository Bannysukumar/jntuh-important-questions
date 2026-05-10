import { FirebaseError } from 'firebase/app'

export function getAuthErrorMessage(err: unknown): string {
  const code = err instanceof FirebaseError ? err.code : ''
  const map: Record<string, string> = {
    'auth/email-already-in-use': 'This email is already registered. Sign in instead.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/weak-password': 'Use at least 6 characters for your password.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/too-many-requests': 'Too many attempts. Try again later.',
    'auth/network-request-failed': 'Network error. Check your connection.',
  }
  return map[code] ?? 'Something went wrong. Please try again.'
}
