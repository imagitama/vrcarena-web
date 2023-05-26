import { UserAdminMetaFieldNames, UserRoles } from '../hooks/useDatabaseQuery'

export function getIsRoleAStaffMember(role) {
  return role === UserRoles.Admin || role === UserRoles.Editor
}

export function getUserIsStaffMember(user) {
  return (
    user[UserAdminMetaFieldNames.role] === UserRoles.Admin ||
    user[UserAdminMetaFieldNames.role] === UserRoles.Editor
  )
}
