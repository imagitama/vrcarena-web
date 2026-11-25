import { User as SupabaseUser } from '@supabase/supabase-js'

import { client } from '@/supabase'
import { store } from '@/store'
import {
  PASSWORD_NEEDS_CHANGING,
  USER_IS_LOADING,
  USER_LOADED,
  USER_UNLOADED,
} from '@/slices/user'
import { readFirstRecordOrThrow, readRecord } from '@/data-store'
import { MyUser, ViewNames } from '@/modules/users'
import { accountVerifySuccess } from './slices/app'

export const loadUserIntoStore = async (userId: string | null) => {
  try {
    if (!userId) {
      throw new Error('no user ID')
    }

    console.debug(`load user :: loading...`, userId)

    store.dispatch({
      type: USER_IS_LOADING,
    })

    console.debug(`load user :: reading user...`, userId)

    const user = await readFirstRecordOrThrow<MyUser>(
      client,
      ViewNames.GetMyUser
    )

    if (!user) {
      console.error('no user record!')
      throw new Error(
        'Cannot load user into store: user does not seem to exist'
      )
    }

    console.debug(`load user :: found user`, user)

    store.dispatch({
      type: USER_LOADED,
      data: {
        user,
      },
    })

    console.debug(`load user :: user loaded`)
  } catch (err) {
    console.error('failed to load user into store', err)
  }
}

export const unloadUserFromStore = async () => {
  store.dispatch({
    type: USER_UNLOADED,
  })
}

export const getSignedUpWithEmail = (user: SupabaseUser): boolean =>
  user.app_metadata?.provider === 'email'

export const getSignedUpWithDiscord = (user: SupabaseUser): boolean =>
  user.app_metadata?.provider === 'discord'

export const getSignUpMethod = (user: SupabaseUser): string | undefined =>
  user.app_metadata?.provider

export const getHasUserVerifiedTheirEmail = (user: SupabaseUser): boolean =>
  user.email_confirmed_at !== undefined

export let loggedInUser: SupabaseUser | null = null

client.auth.onAuthStateChange(async (event, session) => {
  // avoid locking up the session stuff by doing this a frame later
  setTimeout(async () => {
    console.debug(`auth.onAuthStateChange`, event)
    switch (event) {
      case 'INITIAL_SESSION':
        // fires once on load, session is null if logged out
        if (session?.user) {
          console.debug(`user found in the session, loading...`)

          loggedInUser = session.user

          await loadUserIntoStore(loggedInUser.id)

          for (const cb of onAuthStateChangedCallbacks) {
            cb(true)
          }
        } else {
          console.debug(`no user in the session - skipping`)
        }
        break
      case 'SIGNED_IN':
        const params = new URLSearchParams(window.location.hash.substring(1))
        if (params.get('type') === 'signup') {
          console.debug(`sign in was started from an email verification link`)
          store.dispatch(accountVerifySuccess())
        }

        loggedInUser = session!.user!

        await loadUserIntoStore(loggedInUser.id)

        for (const cb of onAuthStateChangedCallbacks) {
          cb(true)
        }
        break
      case 'SIGNED_OUT':
        loggedInUser = null

        await unloadUserFromStore()

        for (const cb of onAuthStateChangedCallbacks) {
          cb(false)
        }
        break
      case 'TOKEN_REFRESHED':
        // access token renewed
        break
      case 'USER_UPDATED':
        // profile/password changed
        break
      case 'PASSWORD_RECOVERY':
        // user arrived via a password reset link

        store.dispatch({
          type: PASSWORD_NEEDS_CHANGING,
        })
        break
      default:
        console.debug(`unknown auth event: ${event}`)
    }
  }, 0)
})

export const login = async (email: string, password: string) => {
  console.debug('logging in...')

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Login failed:', error.message)
    throw error
  }

  console.debug(`login success!`)

  return data // { user, session }
}

export const logout = async () => {
  console.debug('logging out...')

  await client.auth.signOut()

  console.debug('logout success!')
}

export const signup = async (
  email: string,
  password: string,
  captchaToken: string
) => {
  console.debug(`signing up...`)

  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      captchaToken,
    },
  })

  if (error) {
    console.error('failed to signup:', error)
    throw error
  }

  const { user, session } = data

  console.debug(`signup success!`)

  if (!user) throw new Error('No user')

  if (session) {
    console.debug('user automatically signed in')
  } else {
    console.debug(`user needs to verify their account`)
  }
}

export const getUserId = (): string | null => {
  if (loggedInUser) return loggedInUser.id
  return null
}

type OnAuthStateChangedCallback = (isNowLoggedIn: boolean) => void
let onAuthStateChangedCallbacks: OnAuthStateChangedCallback[] = []

export const onAuthStateChanged = (callback: OnAuthStateChangedCallback) => {
  onAuthStateChangedCallbacks.push(callback)
  return () => {
    onAuthStateChangedCallbacks = onAuthStateChangedCallbacks.filter(
      (cb) => cb !== callback
    )
  }
}

export enum ProviderId {
  Discord = 'discord',
  Google = 'google',
  Twitter = 'twitter', // X is separate
  Email = 'email',
}

export type OAuthProviderId =
  | ProviderId.Discord
  | ProviderId.Google
  | ProviderId.Twitter
