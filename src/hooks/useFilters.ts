import { ActiveFilter, Filter } from '../filters'
import useStorage from './useStorage'

const useFilters = <TRecord>(
  storageKey: string,
  filters: Filter<TRecord>[] = []
): [ActiveFilter<TRecord>[], (newFilters: ActiveFilter<TRecord>[]) => void] => {
  const [storedFilters, storeFilters] = useStorage<ActiveFilter<TRecord>[]>(
    storageKey,
    filters
      .filter((filter) => filter.defaultActive === true)
      .map((filter) => ({
        ...filter,
        value: filter.defaultValue || true,
      }))
  )

  return [storedFilters || [], storeFilters]
}

export default useFilters
