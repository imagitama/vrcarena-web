import { CollectionNames } from '../hooks/useDatabaseQuery'

export const searchIndexNameLabels = {
  [CollectionNames.Assets]: 'assets',
  [CollectionNames.Authors]: 'authors',
  [CollectionNames.Users]: 'users'
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

const initialState = {
  isMenuOpen: false,
  searchTerm: getInitialSearchTerm(),
  searchTableName: getInitialSearchIndexName(),
  darkModeEnabled: true,
  bannerUrl: '',
  bannerFallbackUrl: '',
  searchFilters: [],
  searchCount: 0, // todo: wtf is this
  isSearching: false
}

const OPEN_MENU = 'OPEN_MENU'
const CLOSE_MENU = 'CLOSE_MENU'
const CHANGE_SEARCH_TERM = 'CHANGE_SEARCH_TERM'
const TOGGLE_DARK_MODE = 'TOGGLE_DARK_MODE'
const SET_DARK_MODE_ENABLED = 'SET_DARK_MODE_ENABLED'
const CHANGE_SEARCH_TABLE_NAME = 'CHANGE_SEARCH_TABLE_NAME'
const SET_BANNER_URLS = 'SET_BANNER_URLS'
const OVERRIDE_SEARCH_FILTER = 'OVERRIDE_SEARCH_FILTER'
const ADD_SEARCH_FILTER = 'ADD_SEARCH_FILTER'
const REMOVE_SEARCH_FILTER = 'REMOVE_SEARCH_FILTER'
const CLEAR_SEARCH_FILTERS = 'CLEAR_SEARCH_FILTERS'
const IS_SEARCHING = 'IS_SEARCHING'

export default (state = initialState, action) => {
  switch (action.type) {
    case OPEN_MENU:
      return {
        ...state,
        isMenuOpen: true
      }

    case CLOSE_MENU:
      return {
        ...state,
        isMenuOpen: false
      }

    case CHANGE_SEARCH_TERM:
      return {
        ...state,
        isSearching: action.payload.searchTerm ? true : false, 
        searchTerm: action.payload.searchTerm,
        // a cheeky way to force the site to search again by pressing enter
        searchCount: state.searchCount + 1
      }

    case CHANGE_SEARCH_TABLE_NAME:
      return {
        ...state,
        searchTableName: action.payload.newTableName
      }

    case TOGGLE_DARK_MODE:
      return {
        ...state,
        darkModeEnabled: !state.darkModeEnabled
      }

    case SET_DARK_MODE_ENABLED:
      return {
        ...state,
        darkModeEnabled: action.payload.newValue
      }

    case SET_BANNER_URLS:
      return {
        ...state,
        bannerUrl: action.payload.url
      }

    case OVERRIDE_SEARCH_FILTER:
      return {
        ...state,
        searchFilters: [action.payload.searchFilter]
      }

    case ADD_SEARCH_FILTER:
      return {
        ...state,
        searchFilters: state.searchFilters.concat([action.payload.searchFilter])
      }

    case REMOVE_SEARCH_FILTER:
      return {
        ...state,
        searchFilters: state.searchFilters.filter(
          id => id !== action.payload.searchFilter
        )
      }

    case CLEAR_SEARCH_FILTERS:
      return {
        ...state,
        searchFilters: []
      }

    case IS_SEARCHING:
      return {
        ...state,
        isSearching: action.payload.isSearching
      }

    default:
      return state
  }
}

// ACTIONS

export const openMenu = () => dispatch => {
  dispatch({
    type: OPEN_MENU
  })
}

export const closeMenu = () => dispatch => {
  dispatch({
    type: CLOSE_MENU
  })
}

export const changeSearchTerm = (searchTerm = '') => dispatch => {
  dispatch({
    type: CHANGE_SEARCH_TERM,
    payload: {
      searchTerm
    }
  })
}

export const changeSearchTableName = newTableName => dispatch => {
  dispatch({
    type: CHANGE_SEARCH_TABLE_NAME,
    payload: {
      newTableName
    }
  })
}

export const toggleDarkMode = () => dispatch => {
  dispatch({
    type: TOGGLE_DARK_MODE
  })
}

export const setDarkModeEnabled = newValue => dispatch => {
  dispatch({
    type: SET_DARK_MODE_ENABLED,
    payload: {
      newValue
    }
  })
}

export const setBannerUrls = newValue => dispatch => {
  console.debug('Set banner URLs', newValue)
  dispatch({
    type: SET_BANNER_URLS,
    payload: {
      ...newValue
    }
  })
}

export const overrideSearchFilter = searchFilter => dispatch => {
  dispatch({
    type: OVERRIDE_SEARCH_FILTER,
    payload: {
      searchFilter
    }
  })
}

export const addSearchFilter = searchFilter => dispatch => {
  dispatch({
    type: ADD_SEARCH_FILTER,
    payload: {
      searchFilter
    }
  })
}

export const removeSearchFilter = searchFilter => dispatch => {
  dispatch({
    type: REMOVE_SEARCH_FILTER,
    payload: {
      searchFilter
    }
  })
}

export const clearSearchFilters = () => dispatch => {
  dispatch({
    type: CLEAR_SEARCH_FILTERS
  })
}

export const setIsSearching = isSearching => dispatch => {
  dispatch({
    type: IS_SEARCHING,
    payload: {
      isSearching
    }
  })
}
