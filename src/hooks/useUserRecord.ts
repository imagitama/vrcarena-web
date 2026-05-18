import { useSelector } from 'react-redux'

import { loadUserIntoStore } from '@/auth'
import { FullUser } from '@/modules/users'
import { RootState } from '@/modules'
import useSupabaseUserId from './useSupabaseUserId'
import useSupabaseClient from './useSupabaseClient'

const useUserRecord = (): [boolean, boolean, FullUser | null, () => void] => {
  const userId = useSupabaseUserId()
  const { isLoading, isErrored, record } = useSelector(({ user }: RootState) => ({ record: user.user, isLoading: user.isLoading, isErrored: user.isErrored }))
  const supabase = useSupabaseClient()

  const hydrate = () => loadUserIntoStore(supabase, userId, false)

  return [isLoading, isErrored, record, hydrate]
}

export default useUserRecord
