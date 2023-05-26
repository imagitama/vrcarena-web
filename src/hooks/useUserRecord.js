import { useSelector } from 'react-redux'
import useSupabaseUserId from './useSupabaseUserId'
import { loadUserIntoStore } from '../auth'

export default () => {
  const userId = useSupabaseUserId()
  const isLoading = useSelector(({ user }) => user.isLoading)
  const isErrored = useSelector(({ user }) => user.isErrored)
  const record = useSelector(({ user }) => user.user)

  const hydrate = () => loadUserIntoStore(userId, false)

  return [isLoading, isErrored, record, hydrate]
}
