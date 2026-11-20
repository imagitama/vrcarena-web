import { shallowEqual, useSelector } from 'react-redux'

import { loadUserIntoStore } from '@/auth'
import { MyUser } from '@/modules/users'
import { UserState } from '@/slices/user'
import { RootState } from '@/slices'
import useSupabaseUserId from './useSupabaseUserId'
import { DataStoreErrorCode } from '@/data-store'

const useUserRecord = (): [
  boolean,
  DataStoreErrorCode | null,
  MyUser | null,
  () => void
] => {
  const userId = useSupabaseUserId()
  const { isLoading, lastErrorCode, user } = useSelector<
    RootState,
    Omit<UserState, 'passwordNeedsChanging'>
  >(
    ({ user }) => ({
      isLoading: user.isLoading,
      lastErrorCode: user.lastErrorCode,
      user: user.user,
    }),
    shallowEqual
  )

  const hydrate = () => loadUserIntoStore(userId)

  // console.debug(`useUserRecord`, { user })

  return [isLoading, lastErrorCode, user, hydrate]
}

export default useUserRecord
