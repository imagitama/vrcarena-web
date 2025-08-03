import {
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable,
} from 'firebase/functions'
import { initializeApp } from 'firebase/app'
import * as Sentry from '@sentry/browser'
import { inDevelopment } from './environment'
import {
  connectAuthEmulator,
  getAuth,
  User as FirebaseUser,
  updatePassword,
  updateEmail,
} from 'firebase/auth'

export type { FirebaseUser }

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
}

export const firebaseApp = initializeApp(firebaseConfig)
export const functions = getFunctions(firebaseApp)
export const auth = getAuth(firebaseApp)

if (
  process.env.REACT_APP_USE_EMULATORS === 'true' ||
  process.env.REACT_APP_USE_FUNCTIONS_EMULATOR === 'true'
) {
  console.debug(`using functions emulator`)
  connectFunctionsEmulator(functions, 'localhost', 5000)
}

if (
  process.env.REACT_APP_USE_EMULATORS === 'true' ||
  process.env.REACT_APP_USE_AUTH_EMULATOR === 'true'
) {
  console.debug(`using auth emulator`)
  connectAuthEmulator(auth, 'http://localhost:9099')
}

export const logout = () => auth.signOut()

export const roles = {
  ADMIN: 'ADMIN',
}

export let loggedInUserId: string | null = null
export let loggedInUser: FirebaseUser | null = null

auth.onAuthStateChanged((user) => {
  if (user) {
    loggedInUserId = user.uid
    loggedInUser = user

    Sentry.setUser({
      id: user.uid,
      username: user.displayName || undefined,
      email: user.email || undefined,
    })
  } else {
    Sentry.setUser(null)

    loggedInUserId = null
    loggedInUser = null
  }
})

interface HttpsCallableResult<TData> {
  readonly data: TData
}

export const callFunction = async <TPayload, TResult>(
  name: string,
  data?: TPayload,
  inDevResult?: TResult
): Promise<HttpsCallableResult<TResult>> => {
  console.debug(`calling function "${name}"`, data)

  if (inDevelopment() && inDevResult) {
    return Promise.resolve({ data: inDevResult })
  }

  const callFunction = httpsCallable(functions, name)
  const result = await callFunction(data)

  console.debug(`function "${name}" complete`, result)

  return result as HttpsCallableResult<TResult>
}

export const getFunctionUrl = (functionName: string): string => {
  const region = functions.region
  const projectId = firebaseApp.options.projectId

  if (!region || !projectId) {
    throw new Error('Missing data')
  }

  if (inDevelopment()) {
    return `http://127.0.0.1:5000/${projectId}/${region}/${functionName}`
  }

  return `https://${region}-${projectId}.cloudfunctions.net/${functionName}`
}

export const callFunctionWithFile = async <TResult>(
  name: string,
  file: File,
  data?: { [key: string]: any },
  inDevResult?: any
): Promise<HttpsCallableResult<TResult>> => {
  console.debug(`calling function "${name}" with file`, file, data)

  if (inDevelopment() && inDevResult) {
    return Promise.resolve(inDevResult)
  }

  const formData = new FormData()
  formData.append('file', file)

  if (data) {
    for (const key in data) {
      formData.append(key, data[key])
    }
  }

  try {
    const url = getFunctionUrl(name)

    console.debug(`call "${url}"`)

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    })

    // NOTE: onRequest function is modelled on HTTP callable functions
    // so will return 200 even on errors
    if (!response.ok) {
      throw new Error(
        `Response not OK: ${response.status} ${response.statusText}`
      )
    }

    const result = await response.json()

    console.debug(`function "${name}" complete`, result)

    return { data: result } as HttpsCallableResult<TResult>
  } catch (error) {
    console.error(`Failed calling function "${name}"`, error)
    throw error
  }
}

export const changeLoggedInUserEmail = async (
  newEmail: string
): Promise<void> => {
  console.debug(`changing logged in user's email to "${newEmail}"...`)

  if (!auth.currentUser) {
    throw new Error('Need a usser')
  }

  await updateEmail(auth.currentUser, newEmail)

  console.debug(`changed logged in user's email successfully`)
}

export const changeLoggedInUserPassword = async (
  newPassword: string
): Promise<void> => {
  console.debug(`changing logged in user's password...`)

  if (!newPassword) {
    throw new Error('Need a value')
  }

  if (!auth.currentUser) {
    throw new Error('Need a user')
  }

  await updatePassword(auth.currentUser, newPassword)

  console.debug(`changed logged in user's password successfully`)
}
