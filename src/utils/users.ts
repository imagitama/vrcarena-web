import { BanStatus, CoreUserFields, UserRoles } from '@/modules/users'

export function getIsRoleAStaffMember(role: UserRoles): boolean {
  return role === UserRoles.Admin || role === UserRoles.Editor
}

export function getUserIsStaffMember(user: CoreUserFields): boolean {
  return getIsRoleAStaffMember(user.role)
}

export const getIsUserBanned = (user: CoreUserFields): boolean =>
  user.banstatus === BanStatus.Banned
