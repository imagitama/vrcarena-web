import { AnyAction } from 'redux'
import { FullUser } from './users'

export const USER_IS_LOADING = 'user/USER_IS_LOADING'
export const USER_IS_DONE_LOADING = 'user/USER_IS_DONE_LOADING'
export const USER_IS_ERRORED = 'user/USER_IS_ERRORED'
export const USER_LOADED = 'user/USER_LOADED'
export const USER_UNLOADED = 'user/USER_UNLOADED'

export interface UserState {
  isLoading: boolean
  isErrored: boolean
  user: null | FullUser
}

const initialState: UserState = {
  isLoading: false,
  isErrored: false,
  user: null,
}

export type NotificationPreferencesMethods = { [methodName: string]: boolean }
export type NotificationPreferencesEvents = { [eventName: string]: boolean }

export interface NotificationPreferences {
  methods: NotificationPreferencesMethods
  events: NotificationPreferencesEvents
}

export interface UserPreferences {
  id: string
  enabledadultcontent: boolean
  notificationemail: string
  notificationprefs: NotificationPreferences
  tagblacklist: string[]
  showmoreinfo: boolean
}

export const CollectionNames = {
  Users: 'users',
  UsersMeta: 'usermeta',
  UsersAdminMeta: 'useradminmeta',
  UserPreferences: 'userpreferences',
}

export const UserPreferencesFieldNames = {
  enabledAdultContent: 'enabledadultcontent',
  notificationEmail: 'notificationemail',
  notificationPrefs: 'notificationprefs',
}

export default (state = initialState, action: AnyAction) => {
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
        isErrored: true,
      }

    case USER_LOADED:
      return {
        ...state,
        isLoading: false,
        isErrored: false,
        user: action.data.user,
      }

    case USER_UNLOADED:
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
