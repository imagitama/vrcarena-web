import { AnyAction, Dispatch } from 'redux'
import { CollectionNames } from '../hooks/useDatabaseQuery'
import { Asset } from './assets'
import { UserPreferences } from './user'

export const searchIndexNameLabels = {
  [CollectionNames.Assets]: 'assets',
  [CollectionNames.Authors]: 'authors',
  [CollectionNames.Users]: 'users',
}

function isSearchRoute() {
  return window.location.pathname.includes('search')
}

function getInitialSearchIndexName() {
  if (isSearchRoute()) {
    const chunks = window.location.pathname.split('/')
    const foundSearchIndexLabel = chunks[2]
    const foundSearchIndex = Object.entries(searchIndexNameLabels).find(
      ([, label]) => label === foundSearchIndexLabel
    )

    if (!foundSearchIndex) {
      throw new Error(
        `Found search index label "${foundSearchIndexLabel}" but no exist: ${Object.values(
          searchIndexNameLabels
        )}`
      )
    }

    return foundSearchIndex[0]
  }

  return CollectionNames.Assets
}

function getInitialSearchTerm() {
  if (isSearchRoute()) {
    const chunks = window.location.pathname.split('/')
    const foundSearchIndexLabel = decodeURIComponent(chunks[3])
    return foundSearchIndexLabel
  }

  return ''
}

interface SearchFilter {}

export interface AppState {
  isMenuOpen: boolean
  searchTerm: string
  searchTableName: string
  bannerUrl: string
  bannerFallbackUrl: string
  searchFilters: SearchFilter[]
  searchCount: number // a (bad) way to force a re-render
  isSearching: boolean
  bulkEditIds: null | string[] // null is not in edit mode
  isSelectingAll: boolean
  bulkEditAssetDatas: Asset[]
  userPrefs: UserPreferences | null
}

const initialState: AppState = {
  isMenuOpen: false,
  searchTerm: getInitialSearchTerm(),
  searchTableName: getInitialSearchIndexName(),
  bannerUrl: '',
  bannerFallbackUrl: '',
  searchFilters: [],
  searchCount: 0,
  isSearching: false,
  bulkEditIds: null,
  isSelectingAll: false,
  bulkEditAssetDatas: [],
  userPrefs: null,
}

const OPEN_MENU = 'OPEN_MENU'
const CLOSE_MENU = 'CLOSE_MENU'
const CHANGE_SEARCH_TERM = 'CHANGE_SEARCH_TERM'
const CHANGE_SEARCH_TABLE_NAME = 'CHANGE_SEARCH_TABLE_NAME'
const SET_BANNER_URLS = 'SET_BANNER_URLS'
const OVERRIDE_SEARCH_FILTER = 'OVERRIDE_SEARCH_FILTER'
const ADD_SEARCH_FILTER = 'ADD_SEARCH_FILTER'
const REMOVE_SEARCH_FILTER = 'REMOVE_SEARCH_FILTER'
const CLEAR_SEARCH_FILTERS = 'CLEAR_SEARCH_FILTERS'
const IS_SEARCHING = 'IS_SEARCHING'
const ENTER_BULK_EDIT_MODE = 'ENTER_BULK_EDIT_MODE'
const LEAVE_BULK_EDIT_MODE = 'LEAVE_BULK_EDIT_MODE'
const TOGGLE_BULK_EDIT_ID = 'TOGGLE_BULK_EDIT_ID'
const SELECT_BULK_EDIT_ID = 'SELECT_BULK_EDIT_ID'
const SET_SELECT_ALL = 'SET_SELECT_ALL'
const SET_USER_PREFS = 'SET_USER_PREFS'

export default (
  state: AppState = initialState,
  action: AnyAction
): AppState => {
  switch (action.type) {
    case OPEN_MENU:
      return {
        ...state,
        isMenuOpen: true,
      }

    case CLOSE_MENU:
      return {
        ...state,
        isMenuOpen: false,
      }

    case CHANGE_SEARCH_TERM:
      return {
        ...state,
        isSearching: false,
        searchTerm: action.payload.searchTerm,
        // a cheeky way to force the site to search again by pressing enter
        searchCount: state.searchCount + 1,
      }

    case CHANGE_SEARCH_TABLE_NAME:
      return {
        ...state,
        searchTableName: action.payload.newTableName,
      }

    case SET_BANNER_URLS:
      return {
        ...state,
        bannerUrl: action.payload.url,
      }

    case OVERRIDE_SEARCH_FILTER:
      return {
        ...state,
        searchFilters: [action.payload.searchFilter],
      }

    case ADD_SEARCH_FILTER:
      return {
        ...state,
        searchFilters: state.searchFilters.concat([
          action.payload.searchFilter,
        ]),
      }

    case REMOVE_SEARCH_FILTER:
      return {
        ...state,
        searchFilters: state.searchFilters.filter(
          (id) => id !== action.payload.searchFilter
        ),
      }

    case CLEAR_SEARCH_FILTERS:
      return {
        ...state,
        searchFilters: [],
      }

    case IS_SEARCHING:
      return {
        ...state,
        isSearching: action.payload.isSearching,
      }

    case ENTER_BULK_EDIT_MODE:
      return {
        ...state,
        bulkEditIds: [],
      }

    case LEAVE_BULK_EDIT_MODE:
      return {
        ...state,
        bulkEditIds: null,
      }

    case TOGGLE_BULK_EDIT_ID:
      if (!state.bulkEditIds) {
        return { ...state }
      }
      return {
        ...state,
        bulkEditIds: state.bulkEditIds.includes(action.payload.id)
          ? state.bulkEditIds.filter(
              (idToCheck) => idToCheck !== action.payload.id
            )
          : state.bulkEditIds.concat([action.payload.id]),
        bulkEditAssetDatas: action.payload.asset
          ? state.bulkEditAssetDatas.concat([action.payload.asset])
          : state.bulkEditAssetDatas,
      }

    case SELECT_BULK_EDIT_ID:
      if (!state.bulkEditIds) {
        return {
          ...state,
          bulkEditIds: [action.payload.id],
          bulkEditAssetDatas: action.payload.asset
            ? state.bulkEditAssetDatas.concat([action.payload.asset])
            : state.bulkEditAssetDatas,
        }
      }
      return {
        ...state,
        bulkEditIds: state.bulkEditIds.includes(action.payload.id)
          ? state.bulkEditIds
          : state.bulkEditIds.concat([action.payload.id]),
        bulkEditAssetDatas: action.payload.asset
          ? state.bulkEditAssetDatas.concat([action.payload.asset])
          : state.bulkEditAssetDatas,
      }

    case SET_SELECT_ALL:
      return {
        ...state,
        isSelectingAll: action.payload.newValue,
      }

    case SET_USER_PREFS:
      return {
        ...state,
        userPrefs: action.payload.newUserPrefs,
      }

    default:
      return state
  }
}

export const openMenu = () => (dispatch: Dispatch) => {
  dispatch({
    type: OPEN_MENU,
  })
}

export const closeMenu = () => (dispatch: Dispatch) => {
  dispatch({
    type: CLOSE_MENU,
  })
}

export const changeSearchTerm =
  (searchTerm = '') =>
  (dispatch: Dispatch) => {
    dispatch({
      type: CHANGE_SEARCH_TERM,
      payload: {
        searchTerm,
      },
    })
  }

export const changeSearchTableName =
  (newTableName: string) => (dispatch: Dispatch) => {
    dispatch({
      type: CHANGE_SEARCH_TABLE_NAME,
      payload: {
        newTableName,
      },
    })
  }

export const setBannerUrls =
  (newValue: { url: string }) => (dispatch: Dispatch) => {
    console.debug('Set banner URLs', newValue)
    dispatch({
      type: SET_BANNER_URLS,
      payload: {
        ...newValue,
      },
    })
  }

export const overrideSearchFilter =
  (searchFilter: SearchFilter) => (dispatch: Dispatch) => {
    dispatch({
      type: OVERRIDE_SEARCH_FILTER,
      payload: {
        searchFilter,
      },
    })
  }

export const addSearchFilter =
  (searchFilter: SearchFilter) => (dispatch: Dispatch) => {
    dispatch({
      type: ADD_SEARCH_FILTER,
      payload: {
        searchFilter,
      },
    })
  }

export const removeSearchFilter =
  (searchFilter: SearchFilter) => (dispatch: Dispatch) => {
    dispatch({
      type: REMOVE_SEARCH_FILTER,
      payload: {
        searchFilter,
      },
    })
  }

export const clearSearchFilters = () => (dispatch: Dispatch) => {
  dispatch({
    type: CLEAR_SEARCH_FILTERS,
  })
}

export const setIsSearching = (newVal: boolean) => (dispatch: Dispatch) => {
  dispatch({
    type: IS_SEARCHING,
    payload: {
      isSearching: newVal,
    },
  })
}

export const enterBulkEditMode = () => ({
  type: ENTER_BULK_EDIT_MODE,
})

export const leaveBulkEditMode = () => ({
  type: LEAVE_BULK_EDIT_MODE,
})

export const toggleBulkEditId = (id: string, asset?: Asset) => ({
  type: TOGGLE_BULK_EDIT_ID,
  payload: {
    id,
    asset,
  },
})

export const selectBulkEditId = (id: string, asset?: Asset) => ({
  type: SELECT_BULK_EDIT_ID,
  payload: {
    id,
    asset,
  },
})

export const setSelectingAll = (newValue: boolean) => ({
  type: SET_SELECT_ALL,
  payload: {
    newValue,
  },
})

export const setUserPrefs = (newUserPrefs: UserPreferences) => ({
  type: SET_USER_PREFS,
  payload: {
    newUserPrefs,
  },
})
