import { DataStoreErrorCode } from '@/data-store'
import useUserRecord from './useUserRecord'
import { UserPreferences } from '@/modules/users'

const useUserPreferences = (): [
  boolean,
  DataStoreErrorCode | null,
  UserPreferences | null,
  () => void
] => {
  const [isLoading, lastErrorCode, myUser, hydrate] = useUserRecord()
  return [isLoading, lastErrorCode, myUser, hydrate]
}

export default useUserPreferences
