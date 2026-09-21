import { UserRoles } from '@/modules/users'
import useUserRecord from './useUserRecord'
import { inDevelopment } from '@/environment'

export default (): boolean | null => {
  const [, , user] = useUserRecord()
  return (
    user && (user.role === UserRoles.Editor || user.role === UserRoles.Admin)
  )
}
