import useUserId from './useUserId'
import useDataStoreItem from './useDataStoreItem'
import { CollectionNames, UserPreferences } from '../modules/user'

export default (): [
  boolean,
  boolean,
  UserPreferences | false | null,
  () => void
] => {
  const userId = useUserId()
  return useDataStoreItem<UserPreferences>(
    CollectionNames.UserPreferences,
    userId || false
  )
}
