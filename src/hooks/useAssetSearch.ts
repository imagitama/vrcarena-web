import { useDispatch } from 'react-redux'
import useAlgoliaSearch, {
  AssetSearchResult,
  Indexes,
} from './useAlgoliaSearch'
import { setIsSearching } from '../modules/app'
import { useEffect } from 'react'
import useIsAdultContentEnabled from './useIsAdultContentEnabled'

const defaultLimit = 50

const useAssetSearch = (
  searchTerm: string,
  filtersByFieldName: { [fieldName: string]: string[] } = {},
  limit = defaultLimit
): [boolean, boolean, AssetSearchResult[] | null] => {
  const isAdultContentEnabled = useIsAdultContentEnabled()

  // always start with this filter to minimize chance of mistakenly showing it
  let filters: string[] = ['isAdult != 1']

  if (filtersByFieldName.category) {
    filters.push(`category: ${filtersByFieldName.category}`)
  }

  if (isAdultContentEnabled) {
    filters = filters.filter((filter) => filter !== 'isAdult != 1')
  }

  const [isLoading, isErrored, assetSearchResults] = useAlgoliaSearch(
    Indexes.Assets,
    searchTerm,
    filters.join(' AND '),
    limit
  )
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setIsSearching(isLoading))
  }, [isLoading])

  const assets = assetSearchResults || null

  return [isLoading, isErrored, assets]
}

export default useAssetSearch
