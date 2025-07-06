import { BanStatus, FullUser, UserRoles } from '../modules/users'

export function getIsRoleAStaffMember(role: UserRoles): boolean {
  return role === UserRoles.Admin || role === UserRoles.Editor
}

export function getUserIsStaffMember(user: FullUser): boolean {
  return getIsRoleAStaffMember(user.role)
}

export const getIsUserBanned = (user: FullUser): boolean =>
  user.banstatus === BanStatus.Banned
