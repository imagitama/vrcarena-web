import {
  UserAdminMetaFieldNames,
  UserFieldNames,
  UserMetaFieldNames,
  UserRoles
} from './useDatabaseQuery'
import useUserRecord from './useUserRecord'

export default () => {
  const [, , user] = useUserRecord()
  return (
    user &&
    (user[UserAdminMetaFieldNames.role] === UserRoles.Editor ||
      user[UserAdminMetaFieldNames.role] === UserRoles.Admin)
  )
}
