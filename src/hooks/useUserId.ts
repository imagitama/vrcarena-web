import useSupabaseUserId from './useSupabaseUserId'

export default (): string | null => {
  return useSupabaseUserId()
}
