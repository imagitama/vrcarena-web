import useStorage from './useStorage'

const STORAGE_KEY = 'third-party-consent'

const useThirdPartyConsent = (): [
  null | boolean,
  (newVal: boolean) => void
] => {
  const [storedVal, setStoredVal] = useStorage<boolean>(STORAGE_KEY)
  return [storedVal, setStoredVal]
}

export default useThirdPartyConsent
