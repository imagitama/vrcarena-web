import { AnyAction } from 'redux'
import { MyUser } from '@/modules/users'
import { DataStoreErrorCode } from '@/data-store'

export const USER_IS_LOADING = 'user/USER_IS_LOADING'
export const USER_IS_DONE_LOADING = 'user/USER_IS_DONE_LOADING'
export const USER_IS_ERRORED = 'user/USER_IS_ERRORED'
export const USER_LOADED = 'user/USER_LOADED'
export const USER_UNLOADED = 'user/USER_UNLOADED'
export const PASSWORD_NEEDS_CHANGING = 'user/PASSWORD_NEEDS_CHANGING'

export interface UserState {
  isLoading: boolean
  lastErrorCode: DataStoreErrorCode | null
  user: null | MyUser
  passwordNeedsChanging: boolean
}

const initialState: UserState = {
  isLoading: false,
  lastErrorCode: null,
  user: null,
  passwordNeedsChanging: false,
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

    case PASSWORD_NEEDS_CHANGING:
      return {
        ...state,
        passwordNeedsChanging: true,
      }

    default:
      return state
  }
}
