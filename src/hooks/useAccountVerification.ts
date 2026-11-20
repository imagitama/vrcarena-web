import { getHasUserVerifiedTheirEmail, getSignedUpWithEmail } from '@/auth'
import useSupabaseUser from './useSupabaseUser'

// returns true/false if signed up with email
// otherwise null
export const useAccountVerification = (): boolean | null => {
  const user = useSupabaseUser()

  if (!user) {
    // console.debug('NO USER!!!')
    return false
  }

  if (!getSignedUpWithEmail(user)) {
    // console.debug('NOT EMAIL!!!')
    return null
  }

  // console.debug('CHECK', user, getHasUserVerifiedTheirEmail(user))

  return getHasUserVerifiedTheirEmail(user)
}

export default useAccountVerification
