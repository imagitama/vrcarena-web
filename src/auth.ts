import { store } from './store'
import { USER_IS_LOADING, USER_LOADED, USER_UNLOADED } from './modules/user'
import { readRecord } from './data-store'
import { SupabaseClient } from '@supabase/supabase-js'
import { FirebaseUser } from './firebase'

export const loadUserIntoStore = async (
  supabase: SupabaseClient,
  userId: string | null,
  showLoading: boolean = true
) => {
  if (!userId) {
    throw new Error('Cannot load user into store - no user ID')
  }

  console.debug(`load user :: loading...`, userId)

  if (showLoading) {
    store.dispatch({
      type: USER_IS_LOADING,
    })
  }

  const user = await readRecord(supabase, 'getmyuser', userId)

  console.debug(`load user :: found user`, user)

  if (!user) {
    throw new Error('Cannot load user into store: user does not seem to exist!')
  }

  store.dispatch({
    type: USER_LOADED,
    data: {
      user,
    },
  })

  console.debug(`load user :: user loaded`)
}

export const unloadUserFromStore = async () => {
  store.dispatch({
    type: USER_UNLOADED,
  })
}

export const getSignedUpWithDiscord = (user: FirebaseUser): boolean =>
  !user.providerData || !user.providerData.length

export const getHasUserVerifiedTheirEmail = (user: FirebaseUser): boolean =>
  user.emailVerified || user.email === null || getSignedUpWithDiscord(user)
