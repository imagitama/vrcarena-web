import useUserId from './useUserId'
import useDataStoreItem from './useDataStoreItem'
import { CollectionNames, UserPreferences } from '../modules/user'
import { DataStoreError } from '../data-store'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setUserPrefs } from '../modules/app'

// let lastInstanceIdx = -1

// let lastKnownUserPrefs: UserPreferences | null = null
let isSomethingGoingToHydrate = false
let isHydrating = false

export default (
  forceHydrate?: boolean
): [
  boolean,
  null | DataStoreError,
  UserPreferences | false | null,
  () => void
] => {
  const lastKnownUserPrefs: UserPreferences | null = useSelector(
    // @ts-ignore
    (store) => store.app.userPrefs
  )
  const userId = useUserId()
  const dispatch = useDispatch()

  // useEffect(() => { lastInstanceIdx++ })
  // const instanceIdxRef = useRef<number>(lastInstanceIdx)

  const needToHydrate =
    userId &&
    (forceHydrate ||
      (isSomethingGoingToHydrate === false &&
        isHydrating === false &&
        lastKnownUserPrefs === null))

  if (needToHydrate) {
    isSomethingGoingToHydrate = true
  }

  const [isLoading, lastError, userPrefs, hydrate] =
    useDataStoreItem<UserPreferences>(
      CollectionNames.UserPreferences,
      needToHydrate ? userId : false,
      'user-prefs-hook'
    )

  useEffect(() => {
    if (isLoading) {
      isHydrating = true
    }
    if (userPrefs) {
      // console.debug(`useUserPreferences.useEffect userPrefs = truthy`, {
      //   userPrefs,
      // })
      dispatch(setUserPrefs(userPrefs))
    }
  }, [isLoading])

  // console.debug(`useUserPreferences`, {
  //   userId,
  //   isSomethingGoingToHydrate,
  //   needToHydrate,
  //   isLoading,
  //   lastError,
  //   lastKnownUserPrefs,
  //   isHydrating,
  // })

  return [isLoading, lastError, lastKnownUserPrefs, hydrate]
}
