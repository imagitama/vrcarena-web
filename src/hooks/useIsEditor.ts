import { UserRoles } from '../modules/users'
import useUserRecord from './useUserRecord'

export default (): boolean | null => {
  const [, , user] = useUserRecord()
  return (
    user && (user.role === UserRoles.Editor || user.role === UserRoles.Admin)
  )
}
