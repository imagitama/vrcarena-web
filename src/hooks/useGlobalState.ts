import { BasicEvent } from '@/modules/events'
import { PublicSpeciesForCache, Species } from '@/modules/species'
import { Notice } from '@/modules/notices'
import useSupabaseView from './useSupabaseView'
import { DataStoreErrorCode } from '@/data-store'
import { CachedDiscordMessage } from '@/modules/discordmessagecache'
import { AssetCategory } from '@/modules/assets'

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

interface GlobalState extends Record<string, any> {
  // global
  notices: Notice[]
  featuredevents: BasicEvent[]

  // anywhere you can select a species:
  // - home
  species: PublicSpeciesForCache[]

  // home-only
  home: HomepageContent
}

type HydrateFn = () => void

enum ViewNames {
  GetGlobalState = 'getglobalstate',
}

const useGlobalState = (): [
  boolean,
  DataStoreErrorCode | null,
  GlobalState | null,
  HydrateFn
] => {
  // TODO: create an adult version of global state
  // const isAdultContentEnabled = useIsAdultContentEnabled()

  const [isLoading, lastErrorCode, lastResults, , hydrate] =
    useSupabaseView<GlobalState>(ViewNames.GetGlobalState)

  return [
    isLoading,
    lastErrorCode,
    lastResults && lastResults.length ? lastResults[0] : null,
    hydrate,
  ]
}

export default useGlobalState
