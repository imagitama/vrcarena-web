import useSupabaseUserId from './useSupabaseUserId'

export default (): boolean => {
  const doesHaveSupabaseId = !!useSupabaseUserId()
  return doesHaveSupabaseId
}
