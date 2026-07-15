import { SupabaseClient } from '@supabase/supabase-js'
import { Action, Dispatch } from 'redux'

import { BasicEvent } from '@/modules/events'
import { PublicSpeciesForCache, Species } from '@/modules/species'
import { Notice } from '@/modules/notices'
import {
  DataStoreErrorCode,
  getDataStoreErrorCodeFromError,
  readAllRecords,
} from '@/data-store'
import { CachedDiscordMessage } from '@/modules/discordmessagecache'
import { AssetCategory } from '@/modules/assets'
import { handleError } from '@/error-handling'
import { RootState } from '@/modules'

export interface StatsForHomepage {
  assets: {
    totalcount: number
    categories: {
      [AssetCategory.Avatar]: number
      [AssetCategory.Accessory]: number
      [AssetCategory.Animation]: number
      [AssetCategory.Tutorial]: number
      [AssetCategory.Shader]: number
      [AssetCategory.Retexture]: number
      [AssetCategory.WorldAsset]: number
      [AssetCategory.Tool]: number
    }
    freecount: number
  }
  collections: {
    count: number
  }
  wishlists: {
    count: number
  }
  reviews: {
    count: number
  }
  authors: {
    count: number
  }
  users: {
    count: number // unbanned and verified
  }
  patreon: {
    activepatroncount: number
    totalpatroncount: number
  }
  species: {
    speciescount: number
  }
  // vrchatgroup: {
  //   count: number
  // }
}

export interface HomepageContent {
  stats: StatsForHomepage
  recentdiscordannouncement: CachedDiscordMessage | null
  featuredspecies: Species | null
}

export interface GlobalState extends Record<string, any> {
  // global
  notices: Notice[]
  featuredevents: BasicEvent[]

  // anywhere you can select a species:
  // - home
  species: PublicSpeciesForCache[]

  // home-only
  home: HomepageContent
}

export interface GlobalStateSlice {
  globalState: GlobalState | null
  isLoading: boolean
  errorCode: DataStoreErrorCode | null
}

enum ViewNames {
  GetGlobalState = 'getglobalstate',
}

const SET_IS_LOADING = 'SET_IS_LOADING'
const SET_ERROR_CODE = 'SET_ERROR_CODE'
const SET_GLOBAL_STATE = 'SET_GLOBAL_STATE'

const initialState: GlobalStateSlice = {
  isLoading: false,
  errorCode: null,
  globalState: null,
}

export const reducer = (
  state: GlobalStateSlice = initialState,
  action: Action
): GlobalStateSlice => {
  switch (action.type) {
    case SET_IS_LOADING:
      return {
        ...state,
        isLoading: (action as ReturnType<typeof setIsLoading>).payload
          .isLoading,
      }
    case SET_ERROR_CODE:
      return {
        ...state,
        errorCode: (action as ReturnType<typeof setErrorCode>).payload
          .errorCode,
      }
    case SET_GLOBAL_STATE:
      return {
        ...state,
        globalState: (action as ReturnType<typeof setGlobalState>).payload
          .globalState,
      }
    default:
      return state
  }
}

export const hydrateGlobalState =
  (client: SupabaseClient) =>
  async (dispatch: Dispatch, getState: () => RootState): Promise<void> => {
    try {
      dispatch(setIsLoading(true))

      const results = await readAllRecords<GlobalState>(
        client,
        ViewNames.GetGlobalState
      )

      if (!results || results.length !== 1) {
        throw new Error(`Failed to hydrate global state: invalid results`)
      }

      // TODO: store in a single payload

      dispatch(setIsLoading(false))
      dispatch(setGlobalState(results[0]))
    } catch (err) {
      console.error(err)
      handleError(err)

      dispatch(setIsLoading(false))
      dispatch(setErrorCode(getDataStoreErrorCodeFromError(err)))
    }
  }

export const setIsLoading = (isLoading: boolean) => ({
  type: SET_IS_LOADING,
  payload: {
    isLoading,
  },
})

export const setErrorCode = (errorCode: DataStoreErrorCode | null) => ({
  type: SET_ERROR_CODE,
  payload: {
    errorCode,
  },
})

export const setGlobalState = (globalState: GlobalState | null) => ({
  type: SET_GLOBAL_STATE,
  payload: {
    globalState,
  },
})
