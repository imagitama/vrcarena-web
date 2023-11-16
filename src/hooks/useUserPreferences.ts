import useUserId from './useUserId'
import useDataStoreItem from './useDataStoreItem'
import { CollectionNames, UserPreferences } from '../modules/user'
import { DataStoreError } from '../data-store'

export default (): [
  boolean,
  null | DataStoreError,
  UserPreferences | false | null,
  () => void
] => {
  const userId = useUserId()
  return useDataStoreItem<UserPreferences>(
    CollectionNames.UserPreferences,
    userId || false
  )
}
