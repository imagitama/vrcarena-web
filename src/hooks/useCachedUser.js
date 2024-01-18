import { CollectionNames } from './useDatabaseQuery'
import useDataStoreItem from './useDataStoreItem'

export default (userId) => {
  return useDataStoreItem(CollectionNames.Users, userId)
}
