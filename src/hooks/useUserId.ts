import useFirebaseUserId from './useFirebaseUserId'
import useSupabaseUserId from './useSupabaseUserId'

export default (): string | null => {
  const firebaseUserId = useFirebaseUserId()
  const supabaseUserId = useSupabaseUserId()

  if (firebaseUserId && supabaseUserId && firebaseUserId === supabaseUserId) {
    return supabaseUserId
  }

  return null
}
