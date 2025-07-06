import { BanStatus } from '../modules/users'
import useUserRecord from './useUserRecord'

function useIsBanned(): boolean | null {
  const [, , user] = useUserRecord()

  if (!user || !user.banstatus) {
    return null
  }

  return user.banstatus === BanStatus.Banned
}

export default useIsBanned
