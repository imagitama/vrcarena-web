import { createClient } from '@supabase/supabase-js'
import firebase from 'firebase/app'
import { callFunction } from './firebase'
import { handleError } from './error-handling'
import { loadUserIntoStore, unloadUserFromStore } from './auth'
import { saveLastLoggedInDate } from './users'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseKey = process.env.REACT_APP_SUPABASE_API_KEY

export const client = createClient(supabaseUrl, supabaseKey)

let loggedInUserId = null
let onJwtTokenChangedCallbacks = []
let activeJwt = null
let nextJwtExpiryDate
const gapBeforeCheckingMs = 2000
let jwtRefreshTimeout

const errorCodes = {
  NO_USERADMINMETA: 'NO_USERADMINMETA'
}

export const getUserId = () => loggedInUserId

const refreshJwt = async () => {
  console.debug(`Refreshing JWT...`)

  const {
    data: { token, expiryTimestamp, errorCode }
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
  onJwtTokenChangedCallbacks.forEach(cb => cb(activeJwt))

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

firebase.auth().onAuthStateChanged(async user => {
  try {
    if (!user) {
      console.debug(`Firebase user has signed out, signing out of Supabase...`)
      await client.auth.setAuth(null)

      activeJwt = null
      loggedInUserId = null

      stopRefreshingJwt()

      // let our React hooks (like useSupabaseUserId()) know
      onJwtTokenChangedCallbacks.forEach(cb => cb(null))

      await unloadUserFromStore()

      return
    }

    const userId = user.uid
    loggedInUserId = userId

    const { errorCode } = await refreshJwt()

    // the only reportable error is userAdminMeta has not been created yet cause they just signed up
    // so wait for 3 seconds and HOPE it has worked
    // TODO: Make this less fragile somehow
    if (errorCode && errorCode === errorCodes.NO_USERADMINMETA) {
      console.debug(`No user admin meta for user, waiting a few seconds...`)
      await new Promise(resolve => setTimeout(() => resolve(), 3000))
      console.debug(`Wait complete and hoping it is there!`)

      const { errorCode: newErrorCode } = await refreshJwt()

      if (newErrorCode) {
        throw new Error(
          `Tried to refresh JWT again and it failed again: ${newErrorCode}`
        )
      }
    }

    queueRefreshJwt()

    await loadUserIntoStore(userId)

    await saveLastLoggedInDate(userId)
  } catch (err) {
    console.error(err)
    handleError(err)
  }
})

export const onJwtTokenChanged = callback => {
  onJwtTokenChangedCallbacks.push(callback)
  return () => {
    onJwtTokenChangedCallbacks = onJwtTokenChangedCallbacks.filter(
      cb => cb !== callback
    )
  }
}

// JWTs need to expire otherwise anyone who steals it can read/write forever
// so we try and refresh the JWT just before it expires
// so queries do not fail with a 401 error (which is hard to catch right now)
