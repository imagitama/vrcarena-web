import { CommonRecordFields } from './data-store'
import { BanStatus, FullUser, User, UserRoles } from './modules/users'

export const getHasPermissionForRecord = <TRecord extends CommonRecordFields>(
  user: FullUser | User | null,
  record: TRecord | null,
  allowEditingOwnRecord = false
): boolean => {
  if (user === null || record === null) {
    return false
  }

  if (user.banstatus === BanStatus.Banned) {
    return false
  }

  if (user.role === UserRoles.Editor || user.role === UserRoles.Admin) {
    return true
  }

  if (
    allowEditingOwnRecord &&
    record.createdby &&
    user.id === record.createdby
  ) {
    return true
  }

  return false
}

export const getHasPermissionForRoute = (
  user: FullUser | User,
  route: string
): boolean => {
  if (user.banstatus === BanStatus.Banned) {
    return false
  }

  if (user.role === UserRoles.Editor || user.role === UserRoles.Admin) {
    return true
  }

  // TODO: Maybe have a map of this for fine-grain control
  if (route.includes('/edit') || route.includes('/create')) {
    return false
  }

  return true
}
