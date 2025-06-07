// TODO: Move to utils/users.ts

import { callFunction } from './firebase'
import { UserAdminMeta, UserRoles } from './modules/users'

export const getCanUserEditAnyAsset = (userAdminMeta: UserAdminMeta): boolean =>
  userAdminMeta &&
  (userAdminMeta.role === UserRoles.Admin ||
    userAdminMeta.role === UserRoles.Editor)

export const saveLastLoggedInDate = (userId: string) =>
  callFunction('onLogin', { userId })
