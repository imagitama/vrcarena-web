import { useDispatch } from 'react-redux'
import useAlgoliaSearch, {
  AssetSearchResult,
  Indexes,
} from './useAlgoliaSearch'
import { setIsSearching } from '@/modules/app'
import { useEffect } from 'react'
import useIsAdultContentEnabled from './useIsAdultContentEnabled'
import useDataStoreFunction from './useDataStoreFunction'
import { FunctionNames } from '@/modules/assets'
import store from '@/store'

const defaultLimit = 50

export enum ErrorCode {
  Unknown = 'unknown',
}

const useAssetSearch = (
  searchTerm: string,
  filtersByFieldName: { [fieldName: string]: string[] } = {},
  limit = defaultLimit
): [boolean, null | ErrorCode, AssetSearchResult[] | null, boolean] => {
  const isAdultContentEnabled = useIsAdultContentEnabled()

  // always start with this filter to minimize chance of mistakenly showing it
  let filters: string[] = ['isAdult != 1']

  if (filtersByFieldName.category) {
    filters.push(`category: ${filtersByFieldName.category}`)
  }

  if (isAdultContentEnabled) {
    filters = filters.filter((filter) => filter !== 'isAdult != 1')
  }

  const [isAlgoliaLoading, lastAlgoliaErrorCode, algoliaResults] =
    useAlgoliaSearch<AssetSearchResult>(
      Indexes.Assets,
      searchTerm,
      filters.join(' AND '),
      limit
    )

  const usingSimpleSearch =
    lastAlgoliaErrorCode !== null || process.env.NODE_ENV === 'development'

  const [isSimpleLoading, lastSimpleErrorCode, simpleResults] =
    useDataStoreFunction<
      {
        search_term: string
        include_adult: boolean
        p_category: string | null
      },
      AssetSearchResult[]
    >(FunctionNames.SearchAssets, [], usingSimpleSearch, {
      search_term: searchTerm,
      include_adult: isAdultContentEnabled,
      p_category: filtersByFieldName.category
        ? filtersByFieldName.category[0]
        : null,
    })

  const dispatch = useDispatch<typeof store.dispatch>()

  const isLoading = usingSimpleSearch ? isSimpleLoading : isAlgoliaLoading
  const lastErrorCode = usingSimpleSearch
    ? lastSimpleErrorCode
    : lastAlgoliaErrorCode
  const hasErrorCode = lastErrorCode !== null
  const assets = usingSimpleSearch ? simpleResults : algoliaResults

  useEffect(() => {
    dispatch(setIsSearching(usingSimpleSearch ? isLoading : isSimpleLoading))
  }, [usingSimpleSearch, isLoading, isSimpleLoading])

  return [
    usingSimpleSearch ? isLoading : isSimpleLoading,
    hasErrorCode ? ErrorCode.Unknown : null, // TODO: better error code
    assets,
    usingSimpleSearch,
  ]
}

export default useAssetSearch
