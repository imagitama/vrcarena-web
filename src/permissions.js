import { EventsFieldNames } from './data-store'
import {
  PatreonStatuses,
  UserAdminMetaFieldNames,
  UserMetaFieldNames,
  UserRoles
} from './hooks/useDatabaseQuery'

export function canEditUsers(user) {
  if (!user) {
    return false
  }
  return (
    user[UserAdminMetaFieldNames.role] === UserRoles.Editor ||
    user[UserAdminMetaFieldNames.role] === UserRoles.Admin
  )
}

export function canEditComments(user) {
  if (!user) {
    return false
  }
  return (
    user[UserAdminMetaFieldNames.role] === UserRoles.Editor ||
    user[UserAdminMetaFieldNames.role] === UserRoles.Admin
  )
}

export function canCreateDiscordServer(user) {
  if (!user) {
    return false
  }
  return true
}

export function canEditDiscordServer(user) {
  if (!user) {
    return false
  }
  return (
    user[UserAdminMetaFieldNames.role] === UserRoles.Editor ||
    user[UserAdminMetaFieldNames.role] === UserRoles.Admin
  )
}

export function canFeatureAssets(user) {
  if (!user) {
    return false
  }
  if (user[UserMetaFieldNames.patreonStatus] === PatreonStatuses.Patron) {
    return true
  }
  if (
    user[UserAdminMetaFieldNames.role] === UserRoles.Editor ||
    user[UserAdminMetaFieldNames.role] === UserRoles.Admin
  ) {
    return true
  }
  return false
}

export function getCanUserEditThisEvent(user, event) {
  if (!user) {
    return false
  }
  if (
    user[UserAdminMetaFieldNames.role] === UserRoles.Editor ||
    user[UserAdminMetaFieldNames.role] === UserRoles.Admin
  ) {
    return true
  }
  if (user.id === event[EventsFieldNames.createdBy]) {
    return true
  }
  return false
}
