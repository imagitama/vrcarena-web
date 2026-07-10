import { BasicEvent } from '@/modules/events'
import { PublicSpeciesForCache } from '@/modules/species'
import { Notice } from '@/modules/notices'
import useSupabaseView from './useSupabaseView'
import { DataStoreErrorCode } from '@/data-store'

interface GlobalState extends Record<string, any> {
  notices: Notice[]
  featuredevents: BasicEvent[]
  species: PublicSpeciesForCache[]
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
