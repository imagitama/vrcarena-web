import { CollectionNames } from '../modules/assets'
import { PatreonStatus, UserMeta } from '../modules/users'
import useDataStoreItem from './useDataStoreItem'
import useUserId from './useUserId'

const useIsPatron = (): boolean | null => {
  const userId = useUserId()
  const [, , userMeta] = useDataStoreItem<UserMeta>(
    CollectionNames.AssetsMeta,
    userId || false
  )

  return userMeta ? userMeta.patreonstatus === PatreonStatus.Patron : null
}

export default useIsPatron
