import { AnyAction } from 'redux'
import { User as FirebaseUser } from 'firebase/auth'

export const FIREBASE_USER_IS_LOADING = 'firebase/USER_IS_LOADING'
export const FIREBASE_USER_IS_DONE_LOADING = 'firebase/USER_IS_DONE_LOADING'
export const FIREBASE_USER_IS_ERRORED = 'firebase/USER_IS_ERRORED'
export const FIREBASE_USER_LOADED = 'firebase/USER_LOADED'
export const FIREBASE_USER_UNLOADED = 'firebase/USER_UNLOADED'

export interface FirebaseState {
  isLoading: boolean
  isErrored: boolean
  user: FirebaseUser | null
}

const initialState: FirebaseState = {
  isLoading: false,
  isErrored: false,
  user: null,
}

export default (state = initialState, action: AnyAction) => {
  switch (action.type) {
    case FIREBASE_USER_IS_LOADING:
      return {
        ...state,
        isLoading: true,
      }

    case FIREBASE_USER_IS_DONE_LOADING:
      return {
        ...state,
        isLoading: false,
      }

    case FIREBASE_USER_IS_ERRORED:
      return {
        ...state,
        isErrored: true,
      }

    case FIREBASE_USER_LOADED:
      return {
        ...state,
        isLoading: false,
        isErrored: false,
        user: action.data.user,
      }

    case FIREBASE_USER_UNLOADED:
      return {
        ...state,
        isLoading: false,
        isErrored: false,
        user: null,
      }

    default:
      return state
  }
}
