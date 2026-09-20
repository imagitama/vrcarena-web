import { DataStoreErrorCode } from '@/data-store'
import useGlobalState from './useGlobalState'

const useSpeciesNames = (
  speciesIds: string[] | undefined
): [boolean, DataStoreErrorCode | null, string[] | null] => {
  const [isLoading, lastErrorCode, globalState] = useGlobalState()

  const speciesNames =
    speciesIds?.map((id) => {
      const species = globalState?.species.find(
        (speciesItem) => speciesItem.id === id
      )
      return species?.singularname || ''
    }) || null

  return [isLoading, lastErrorCode, speciesNames]
}

export default useSpeciesNames
