// import useUserPreferences from './useUserPreferences'

const useTagBlacklist = (): string[] | null => {
  // TODO: Do not use this hook as it does a brand new query (so can DDOS ourselves)
  // const [, , prefs] = useUserPreferences()
  // return prefs ? prefs.tagblacklist : null
  return null
}

export default useTagBlacklist
