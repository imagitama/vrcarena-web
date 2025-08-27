import { getHasUserVerifiedTheirEmail } from '../auth'
import useFirebaseUser from './useFirebaseUser'
import useIsEditor from './useIsEditor'

export const useAccountVerification = (): boolean => {
  const firebaseUser = useFirebaseUser()
  const isEditor = useIsEditor()

  if (isEditor) {
    return true
  }

  if (!firebaseUser) {
    return false
  }

  return getHasUserVerifiedTheirEmail(firebaseUser)
}

export default useAccountVerification
