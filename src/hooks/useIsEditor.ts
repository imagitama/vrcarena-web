import { Roles } from '../modules/users'
import useUserRecord from './useUserRecord'

export default (): boolean => {
  const [, , user] = useUserRecord()
  return user && (user.role === Roles.Editor || user.role === Roles.Admin)
}
