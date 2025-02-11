import { useDispatch } from 'react-redux'
import useAlgoliaSearch, {
  AssetSearchResult,
  Indexes,
} from './useAlgoliaSearch'
import { setIsSearching } from '../modules/app'
import { useEffect } from 'react'
import useIsAdultContentEnabled from './useIsAdultContentEnabled'
import useDataStoreFunction from './useDataStoreFunction'
import { FunctionNames } from '../modules/assets'

const defaultLimit = 50

export enum ErrorCode {
  Unknown,
}

const useAssetSearch = (
  searchTerm: string,
  filtersByFieldName: { [fieldName: string]: string[] } = {},
  limit = defaultLimit
): [boolean, null | ErrorCode, AssetSearchResult[] | null] => {
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

  // const usingSimpleSearch = lastAlgoliaErrorCode !== null
  const usingSimpleSearch = true

  const [isSimpleLoading, lastSimpleErrorCode, simpleResults] =
    useDataStoreFunction<
      { search_term: string; include_adult: boolean },
      AssetSearchResult
    >(FunctionNames.SearchAssets, usingSimpleSearch, {
      search_term: searchTerm,
      include_adult: isAdultContentEnabled,
    })

  const dispatch = useDispatch()

  const isLoading = usingSimpleSearch ? isSimpleLoading : isAlgoliaLoading
  const lastErrorCode = usingSimpleSearch
    ? lastSimpleErrorCode
    : lastAlgoliaErrorCode
  const hasErrorCode = lastErrorCode !== null
  const assets = usingSimpleSearch ? simpleResults : algoliaResults

  useEffect(() => {
    dispatch(setIsSearching(isLoading))
  }, [isLoading])

  return [isLoading, hasErrorCode ? ErrorCode.Unknown : null, assets]
}

export default useAssetSearch
