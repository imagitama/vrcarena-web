import { ActiveFilter } from '../filters'
// import { OrderDirections } from './useDatabaseQuery'
import useStorage from './useStorage'

const useFilters = <TRecord>(
  storageKey: string
): [ActiveFilter<TRecord>[], (newFilters: ActiveFilter<TRecord>[]) => void] => {
  const [storedFilters, storeFilters] = useStorage<ActiveFilter<TRecord>[]>(
    storageKey,
    []
  )

  return [storedFilters || [], storeFilters]
}

export default useFilters
