import { getHasUserVerifiedTheirEmail } from '../auth'
import useFirebaseUser from './useFirebaseUser'

export const useAccountVerification = (): boolean => {
  const firebaseUser = useFirebaseUser()

  if (!firebaseUser) {
    return false
  }

  return getHasUserVerifiedTheirEmail(firebaseUser)
}

export default useAccountVerification
