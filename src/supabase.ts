import { createClient } from '@supabase/supabase-js'
import firebase from 'firebase/app'
import { callFunction } from './firebase'
import { handleError } from './error-handling'
import { loadUserIntoStore, unloadUserFromStore } from './auth'
import { saveLastLoggedInDate } from './users'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseKey = process.env.REACT_APP_SUPABASE_API_KEY

if (!supabaseUrl) {
  throw new Error('Supabase URL is empty')
}
if (!supabaseKey) {
  throw new Error('Supabase key is empty')
}

export const client = createClient(supabaseUrl, supabaseKey)

let loggedInUserId: null | string = null
let onJwtTokenChangedCallbacks: ((newToken: string | null) => void)[] = []
let activeJwt: string | null = null
let nextJwtExpiryDate: Date | null = null
const gapBeforeCheckingMs = 2000
let jwtRefreshTimeout: NodeJS.Timeout

const errorCodes = {
  NO_USERADMINMETA: 'NO_USERADMINMETA',
}

export const getUserId = () => loggedInUserId

const refreshJwt = async () => {
  console.debug(`Refreshing JWT...`)

  const {
    data: { token, expiryTimestamp, errorCode },
  } = await callFunction('getSupabaseJwt')

  if (errorCode) {
    console.error(`Error code from JWT function: ${errorCode}`)
    return { errorCode }
  }

  if (!token) {
    throw new Error(`Could not set Supabase user ID: no JWT!`)
  }

  nextJwtExpiryDate = new Date(expiryTimestamp * 1000)

  console.debug(`JWT:
token: ${token}
expires: ${nextJwtExpiryDate}
currently: ${new Date()}`)

  client.auth.setAuth(token)

  activeJwt = token
  // let our React hooks (like useSupabaseUserId()) know
  onJwtTokenChangedCallbacks.forEach((cb) => cb(activeJwt))

  console.debug(`JWT has been refreshed`)

  return {}
}

// JWTs need to expire otherwise anyone who steals it can read/write forever
// so we try and refresh the JWT just before it expires
// so queries do not fail with a 401 error (which is hard to catch right now)
const queueRefreshJwt = () => {
  if (!nextJwtExpiryDate) {
    return
  }

  // we need a "gap" just in case the user does a query while we are refreshing their JWT
  // should equal the estimated roundtrip for getting a new JWT (2 sec?)
  const delayMs =
    nextJwtExpiryDate.getTime() - new Date().getTime() - gapBeforeCheckingMs

  console.debug(`Refreshing JWT in ${delayMs / 1000} seconds...`)

  jwtRefreshTimeout = setTimeout(async () => {
    await refreshJwt()
    queueRefreshJwt()
  }, delayMs)
}

const stopRefreshingJwt = () => {
  clearTimeout(jwtRefreshTimeout)
  nextJwtExpiryDate = null
}

let waitForUserAdminMetaTimeout

firebase.auth().onAuthStateChanged(async (user) => {
  try {
    if (!user) {
      console.debug(`Firebase user has signed out, signing out of Supabase...`)

      // @ts-ignore
      client.auth.setAuth(null)

      activeJwt = null
      loggedInUserId = null

      stopRefreshingJwt()

      // let our React hooks (like useSupabaseUserId()) know
      onJwtTokenChangedCallbacks.forEach((cb) => cb(null))

      await unloadUserFromStore()

      return
    }

    console.debug(`Firebase user has signed in, getting a new JWT...`)

    const userId = user.uid
    loggedInUserId = userId

    const { errorCode } = await refreshJwt()

    // the only reportable error is userAdminMeta has not been created yet cause they just signed up
    // TODO: Make this less fragile somehow
    if (errorCode && errorCode === errorCodes.NO_USERADMINMETA) {
      console.debug(`No user admin meta for user, waiting a few seconds...`)

      await new Promise<void>((resolve) => {
        const wait = () => {
          waitForUserAdminMetaTimeout = setTimeout(async () => {
            const { errorCode: newErrorCode } = await refreshJwt()

            if (newErrorCode) {
              console.debug(`Error code ${newErrorCode}, waiting again...`)
              wait()
            } else {
              console.debug(`We finally found it! Proceeding...`)
              resolve()
            }
          }, 2000)
        }
        wait()
      })
    }

    queueRefreshJwt()

    await loadUserIntoStore(userId)

    await saveLastLoggedInDate(userId)
  } catch (err) {
    console.error(err)
    handleError(err)
  }
})

export const onJwtTokenChanged = (
  callback: (newToken: string | null) => void
) => {
  onJwtTokenChangedCallbacks.push(callback)
  return () => {
    onJwtTokenChangedCallbacks = onJwtTokenChangedCallbacks.filter(
      (cb) => cb !== callback
    )
  }
}

// JWTs need to expire otherwise anyone who steals it can read/write forever
// so we try and refresh the JWT just before it expires
// so queries do not fail with a 401 error (which is hard to catch right now)
