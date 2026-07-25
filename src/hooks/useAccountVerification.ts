import { getHasUserVerifiedTheirEmail, getSignedUpWithDiscord } from '@/auth'
import useFirebaseUser from './useFirebaseUser'

export const useAccountVerification = (): boolean => {
  const firebaseUser = useFirebaseUser()

  if (!firebaseUser) {
    return false
  }

  if (getSignedUpWithDiscord(firebaseUser)) {
    return true
  }

  return getHasUserVerifiedTheirEmail(firebaseUser)
}

export default useAccountVerification
