import { AnyAction } from 'redux'
import { MyUser } from './users'
import { DataStoreErrorCode } from '@/data-store'

export const USER_IS_LOADING = 'user/USER_IS_LOADING'
export const USER_IS_DONE_LOADING = 'user/USER_IS_DONE_LOADING'
export const USER_IS_ERRORED = 'user/USER_IS_ERRORED'
export const USER_LOADED = 'user/USER_LOADED'
export const USER_UNLOADED = 'user/USER_UNLOADED'

export interface UserState {
  isLoading: boolean
  lastErrorCode: DataStoreErrorCode | null
  user: null | MyUser
}

const initialState: UserState = {
  isLoading: false,
  lastErrorCode: null,
  user: null,
}

export default (
  state: UserState = initialState,
  action: AnyAction
): UserState => {
  switch (action.type) {
    case USER_IS_LOADING:
      return {
        ...state,
        isLoading: true,
      }

    case USER_IS_DONE_LOADING:
      return {
        ...state,
        isLoading: false,
      }

    case USER_IS_ERRORED:
      return {
        ...state,
        lastErrorCode: action.data.errorCode,
      }

    case USER_LOADED:
      return {
        ...state,
        isLoading: false,
        lastErrorCode: null,
        user: action.data.user,
      }

    case USER_UNLOADED:
      return {
        ...state,
        isLoading: false,
        lastErrorCode: null,
        user: null,
      }

    default:
      return state
  }
}
