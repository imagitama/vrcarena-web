import { useSelector } from 'react-redux'
import useSupabaseUserId from './useSupabaseUserId'

export default () => {
  const doesHaveFirebaseId = useSelector(({ firebase: { auth } }) => !!auth.uid)
  const doesHaveSupabaseId = !!useSupabaseUserId()
  return doesHaveFirebaseId && doesHaveSupabaseId
}
