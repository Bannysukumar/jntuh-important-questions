import type { UserDegree } from '@/types/models'

export interface SignUpProfile {
  displayName: string
  degree: UserDegree
  /** Required when degree is `other` */
  degreeOther?: string
  rollNumber: string
}
