import { useSelector } from 'react-redux'
import useSupabaseUserId from './useSupabaseUserId'
import { loadUserIntoStore } from '../auth'
import { FullUser } from '../modules/users'
import { RootState } from '../modules'
import useSupabaseClient from './useSupabaseClient'

const useUserRecord = (): [boolean, boolean, FullUser | null, () => void] => {
  const userId = useSupabaseUserId()
  const isLoading = useSelector(({ user }: RootState) => user.isLoading)
  const isErrored = useSelector(({ user }: RootState) => user.isErrored)
  const record = useSelector(({ user }: RootState) => user.user)
  const supabase = useSupabaseClient()

  const hydrate = () => loadUserIntoStore(supabase, userId, false)

  return [isLoading, isErrored, record, hydrate]
}

export default useUserRecord
