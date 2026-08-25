import useStorage from './useStorage'

const STORAGE_KEY = 'selected-locale'

const useLocale = () => {
  return useStorage<string>(STORAGE_KEY)
}

export default useLocale
