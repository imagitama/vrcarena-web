import { alreadyOver18Key } from '../config'
import useStorage from './useStorage'
import useUserPreferences from './useUserPreferences'

export default (): boolean => {
  const [, , userPreferences] = useUserPreferences()
  const [isAlreadyOver18] = useStorage(alreadyOver18Key)

  let isEnabled = false

  if (userPreferences && userPreferences.enabledadultcontent) {
    isEnabled = true
  }

  if (isAlreadyOver18) {
    isEnabled = true
  }

  return isEnabled
}
