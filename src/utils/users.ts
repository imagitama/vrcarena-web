import { FullUser, Roles } from '../modules/users'

export function getIsRoleAStaffMember(role: Roles): boolean {
  return role === Roles.Admin || role === Roles.Editor
}

export function getUserIsStaffMember(user: FullUser): boolean {
  return getIsRoleAStaffMember(user.role)
}
