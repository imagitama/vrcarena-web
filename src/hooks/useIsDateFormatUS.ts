import useStorage from '@/hooks/useStorage'

const KEY = 'is-date-format-us'

const useIsDateFormatUS = (): [boolean, (newVal: boolean) => void] => {
  const [isUS, setIsUS] = useStorage<boolean>(KEY)
  return [isUS !== false, setIsUS]
}

export default useIsDateFormatUS
