import useUserPreferences from './useUserPreferences'

const useTagBlacklist = (): string[] | null => {
  const [, , prefs] = useUserPreferences()
  return prefs ? prefs.tagblacklist : null
}

export default useTagBlacklist
