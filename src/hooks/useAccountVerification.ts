import {
  getHasUserVerifiedTheirEmail,
  getSignedUpWithDiscord,
  getSignedUpWithEmail,
} from '@/auth'
import useFirebaseUser from './useFirebaseUser'

// returns true/false if email
// otherwise null
export const useAccountVerification = (): boolean | null => {
  const firebaseUser = useFirebaseUser()

  if (!firebaseUser) {
    return false
  }

  if (!getSignedUpWithEmail(firebaseUser)) {
    return null
  }

  return getHasUserVerifiedTheirEmail(firebaseUser)
}

export default useAccountVerification
