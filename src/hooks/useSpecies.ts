import { DataStoreErrorCode } from '@/data-store'
import useGlobalState from './useGlobalState'
import { PublicSpeciesForCache } from '@/modules/species'

const useSpecies = (): [
  boolean,
  DataStoreErrorCode | null,
  PublicSpeciesForCache[] | null
] => {
  const [isLoading, lastErrorCode, globalState] = useGlobalState()
  return [isLoading, lastErrorCode, globalState ? globalState.species : null]
}

export default useSpecies
