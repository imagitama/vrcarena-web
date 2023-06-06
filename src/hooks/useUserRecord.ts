import { useSelector } from 'react-redux'
import useSupabaseUserId from './useSupabaseUserId'
import { loadUserIntoStore } from '../auth'
import { FullUser } from '../modules/users'

export default (): [boolean, boolean, FullUser, () => void] => {
  const userId = useSupabaseUserId()
  // @ts-ignore
  const isLoading = useSelector(({ user }) => user.isLoading)
  // @ts-ignore
  const isErrored = useSelector(({ user }) => user.isErrored)
  // @ts-ignore
  const record = useSelector(({ user }) => user.user)

  const hydrate = () => loadUserIntoStore(userId, false)

  return [isLoading, isErrored, record, hydrate]
}
