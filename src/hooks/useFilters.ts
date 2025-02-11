import useStorage from './useStorage'

export interface StoredFilter<TRecord> {
  fieldName: Extract<keyof TRecord, string>
  value: any
}

const useFilters = <TRecord>(
  storageKey: string
): [StoredFilter<TRecord>[], (newFilters: StoredFilter<TRecord>[]) => void] => {
  const [storedFilters, storeFilters] = useStorage<StoredFilter<TRecord>[]>(
    storageKey,
    []
  )

  return [storedFilters || [], storeFilters]
}

export default useFilters
