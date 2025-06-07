import { Event } from './modules/events'
import { FullUser, PatreonStatus, UserRoles } from './modules/users'

export function canEditUsers(user: FullUser): boolean {
  if (!user) {
    return false
  }
  return user.role === UserRoles.Editor || user.role === UserRoles.Admin
}

export function canEditComments(user: FullUser): boolean {
  if (!user) {
    return false
  }
  return user.role === UserRoles.Editor || user.role === UserRoles.Admin
}

export function canCreateDiscordServer(user: FullUser): boolean {
  if (!user) {
    return false
  }
  return true
}

export function canEditDiscordServer(user: FullUser): boolean {
  if (!user) {
    return false
  }
  return user.role === UserRoles.Editor || user.role === UserRoles.Admin
}

export function canFeatureAssets(user: FullUser): boolean {
  if (!user) {
    return false
  }
  if (user.patreonstatus === PatreonStatus.Patron) {
    return true
  }
  if (user.role === UserRoles.Editor || user.role === UserRoles.Admin) {
    return true
  }
  return false
}

export function getCanUserEditThisEvent(user: FullUser, event: Event): boolean {
  if (!user) {
    return false
  }
  if (user.role === UserRoles.Editor || user.role === UserRoles.Admin) {
    return true
  }
  if (user.id === event.createdby) {
    return true
  }
  return false
}
