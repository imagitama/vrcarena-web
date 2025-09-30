import { DataStoreErrorCode } from '@/data-store'
import useDataStoreItems, { QueryOptions } from './useDataStoreItems'

const useMissingDataStoreItems = <TItem extends Record<string, any>>(
  collectionName: string,
  ids: string[],
  existingItems: TItem[],
  queryOptions: QueryOptions<TItem>
): [boolean, null | DataStoreErrorCode, TItem[] | null] => {
  const idsToSearch: string[] = ids.filter(
    (id) => !existingItems.some((item) => item.id === id)
  )

  const [isLoading, lastErrorCode, actualResults] = useDataStoreItems<TItem>(
    collectionName,
    idsToSearch.length ? idsToSearch : false,
    queryOptions
  )

  const allResults = actualResults
    ? actualResults.concat(existingItems)
    : existingItems

  console.debug('useMissingDataStoreItems', {
    collectionName,
    ids,
    existingItems,
    idsToSearch,
    actualResults,
  })

  return [isLoading, lastErrorCode, allResults]
}

export default useMissingDataStoreItems
