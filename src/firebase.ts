import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/functions'
import * as Sentry from '@sentry/browser'

import { inDevelopment } from './environment'

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
}

export const firebaseApp = firebase.initializeApp(firebaseConfig)

if (
  process.env.REACT_APP_USE_EMULATORS ||
  process.env.REACT_APP_USE_FUNCTIONS_EMULATOR
) {
  console.debug(`using functions emulator`)
  firebase.functions().useFunctionsEmulator('http://localhost:5000')
}

if (
  process.env.REACT_APP_USE_EMULATORS ||
  process.env.REACT_APP_USE_AUTH_EMULATOR
) {
  console.debug(`using auth emulator`)
  firebase.auth().useEmulator('http://localhost:9099')
}

export const auth = firebaseApp.auth()

export const logout = () => auth.signOut()

export const roles = {
  ADMIN: 'ADMIN',
}

export let loggedInUserId: null | string = null

auth.onAuthStateChanged((user) => {
  if (user) {
    // @ts-ignore
    loggedInUserId = user

    Sentry.setUser({
      id: user.uid,
      username: user.displayName || undefined,
      email: user.email || undefined,
    })
  } else {
    Sentry.setUser(null)

    loggedInUserId = null
  }
})

interface HttpsCallableResult<TData> {
  readonly data: TData
}

export const callFunction = async <TResult>(
  name: string,
  data?: any,
  inDevResult?: any
): Promise<HttpsCallableResult<TResult>> => {
  console.debug(`calling function "${name}"`, data)

  if (inDevelopment() && inDevResult) {
    return Promise.resolve(inDevResult)
  }

  const result = await firebase.app().functions().httpsCallable(name)(data)

  console.debug(`function "${name}" is complete`, result)

  return result as HttpsCallableResult<TResult>
}

export const getFunctionUrl = (functionName: string): string => {
  const app = firebase.app()
  // @ts-ignore Not public
  const region = app.functions().region
  // @ts-ignore
  const projectId = app.options.projectId

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

    console.debug(`function "${name}" is complete`, result)

    return { data: result } as HttpsCallableResult<TResult>
  } catch (error) {
    console.error(`Failed calling function "${name}"`, error)
    throw error
  }
}
