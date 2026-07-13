import { shallowEqual, useSelector } from 'react-redux'

import { loadUserIntoStore } from '@/auth'
import { MyUser } from '@/modules/users'
import { UserState } from '@/modules/user'
import { RootState } from '@/modules'
import useSupabaseUserId from './useSupabaseUserId'
import useSupabaseClient from './useSupabaseClient'
import { DataStoreErrorCode } from '@/data-store'

const useUserRecord = (): [
  boolean,
  DataStoreErrorCode | null,
  MyUser | null,
  () => void
] => {
  const userId = useSupabaseUserId()
  const { isLoading, lastErrorCode, user } = useSelector<RootState, UserState>(
    ({ user }) => ({
      user: user.user,
      isLoading: user.isLoading,
      lastErrorCode: user.lastErrorCode,
    }),
    shallowEqual
  )
  const supabase = useSupabaseClient()

  const hydrate = () => loadUserIntoStore(supabase, userId, false)

  return [isLoading, lastErrorCode, user, hydrate]
}

export default useUserRecord
