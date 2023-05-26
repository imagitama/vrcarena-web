import useFirebaseUserId from './useFirebaseUserId'
import useSupabaseUserId from './useSupabaseUserId'

export default () => {
  const firebaseUserId = useFirebaseUserId()
  const supabaseUserId = useSupabaseUserId()

  if (firebaseUserId && supabaseUserId && firebaseUserId === supabaseUserId) {
    return supabaseUserId
  }

  return null
}
