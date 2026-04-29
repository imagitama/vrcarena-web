import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { CollectionNames, UserPreferences } from '@/modules/user'
import { DataStoreErrorCode } from '@/data-store'
import { setUserPrefs } from '@/modules/app'

import useDataStoreItem from './useDataStoreItem'
import useUserId from './useUserId'

let isSomethingGoingToHydrate = false
let isHydrating = false

export default (
  forceHydrate?: boolean
): [
  boolean,
  null | DataStoreErrorCode,
  UserPreferences | false | null,
  () => void
] => {
  const lastKnownUserPrefs: UserPreferences | null = useSelector(
    // @ts-ignore
    (store) => store.app.userPrefs
  )
  const userId = useUserId()
  const dispatch = useDispatch()

  const needToHydrate =
    userId &&
    (forceHydrate ||
      (isSomethingGoingToHydrate === false &&
        isHydrating === false &&
        lastKnownUserPrefs === null))

  if (needToHydrate) {
    isSomethingGoingToHydrate = true
  }

  const [isLoading, lastErrorCode, userPrefs, hydrate] =
    useDataStoreItem<UserPreferences>(
      CollectionNames.UserPreferences,
      needToHydrate ? userId : false,
      { queryName: 'user-prefs-hook' }
    )

  useEffect(() => {
    if (isLoading) {
      isHydrating = true
    }
    if (userPrefs) {
      dispatch(setUserPrefs(userPrefs))
    }
  }, [isLoading])

  return [isLoading, lastErrorCode, lastKnownUserPrefs, hydrate]
}
