import { store } from './store'
import { USER_IS_LOADING, USER_LOADED, USER_UNLOADED } from './modules/user'
import { readRecord } from './data-store'
import { SupabaseClient } from '@supabase/supabase-js'

export const loadUserIntoStore = async (
  supabase: SupabaseClient,
  userId: string | null,
  showLoading: boolean = true
) => {
  if (!userId) {
    throw new Error('Cannot load user into store - no user ID')
  }

  console.debug(`auth.loadUserIntoStore.start`, userId)

  if (showLoading) {
    store.dispatch({
      type: USER_IS_LOADING,
    })
  }

  const user = await readRecord(supabase, 'getmyuser', userId)

  console.debug(`auth.loadUserIntoStore.user`, user)

  if (!user) {
    throw new Error('Cannot load user into store: user does not seem to exist!')
  }

  store.dispatch({
    type: USER_LOADED,
    data: {
      user,
    },
  })

  console.debug(`auth.loadUserIntoStore.done`)
}

export const unloadUserFromStore = async () => {
  store.dispatch({
    type: USER_UNLOADED,
  })
}
