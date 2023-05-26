import { alreadyOver18Key } from '../config'
import { UserPreferencesFieldNames } from '../modules/user'
import useStorage from './useStorage'
import useUserPreferences from './useUserPreferences'

export default () => {
  const [, , userPreferences] = useUserPreferences()
  const [isAlreadyOver18] = useStorage(alreadyOver18Key)

  let isEnabled = false

  if (
    userPreferences &&
    userPreferences[UserPreferencesFieldNames.enabledAdultContent]
  ) {
    isEnabled = true
  }

  if (isAlreadyOver18) {
    isEnabled = true
  }

  return isEnabled
}
