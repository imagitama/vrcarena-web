import { useSelector } from 'react-redux'
import useSupabaseUserId from './useSupabaseUserId'
import { RootState } from '@/modules'

export default (): boolean => {
  const doesHaveFirebaseId = useSelector<RootState, boolean>(
    ({ firebase }) => firebase.userId !== null
  )
  const doesHaveSupabaseId = !!useSupabaseUserId()
  return doesHaveFirebaseId && doesHaveSupabaseId
}
