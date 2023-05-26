/** GETTERS **/

import { callFunction } from './firebase'
import { UserCacheFieldNames, UserRoles } from './hooks/useDatabaseQuery'

export const getCanUserEditAnyAsset = userAdminMeta =>
  userAdminMeta &&
  (userAdminMeta[UserCacheFieldNames.role] === UserRoles.Admin ||
    userAdminMeta[UserCacheFieldNames.role] === UserRoles.Editor)

export const saveLastLoggedInDate = userId =>
  callFunction('onLogin', { userId })
