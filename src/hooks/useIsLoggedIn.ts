import { useSelector } from 'react-redux'
import useSupabaseUserId from './useSupabaseUserId'

export default (): boolean => {
  const doesHaveFirebaseId = useSelector(
    ({ firebase: { auth } }: any) => !!auth.uid
  )
  const doesHaveSupabaseId = !!useSupabaseUserId()
  return doesHaveFirebaseId && doesHaveSupabaseId
}
