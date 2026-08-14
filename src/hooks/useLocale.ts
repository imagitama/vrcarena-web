import useStorage from './useStorage'

const useLocale = () => {
  return useStorage<string>('selected-locale')
}

export default useLocale
