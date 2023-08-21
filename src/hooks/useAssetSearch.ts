import { useDispatch } from 'react-redux'
import { Asset } from '../modules/assets'
import useAlgoliaSearch, {
  AssetSearchResult,
  Indexes
} from './useAlgoliaSearch'
import { setIsSearching } from '../modules/app'
import { useEffect } from 'react'
import useIsAdultContentEnabled from './useIsAdultContentEnabled'

const defaultLimit = 50

const mapAssetSearchResultsToAssets = (
  assetSearchResults: AssetSearchResult[]
): Asset[] =>
  // @ts-ignore
  assetSearchResults.map(assetSearchResult => ({
    ...assetSearchResult,
    thumbnailurl: assetSearchResult.thumbnailUrl,
    shortdescription: '',
    pedestalvideourl: '',
    pedestalfallbackimageurl: '',
    author: '',
    category: '',
    tags: [],
    bannerurl: '',
    fileurls: [],
    slug: '',
    species: [],
    vrchatclonableavatarids: [],
    vrchatclonableworldids: [],
    priceusd: '',
    sourceurl: '',
    isadult: assetSearchResult.isAdult,
    relations: [],
    tutorialsteps: [],
    ranks: [],
    discordserver: '',
    createdat: undefined
  }))

export default (
  searchTerm: string,
  filtersByFieldName: { [fieldName: string]: string[] } = {},
  limit = defaultLimit
): [boolean, boolean, Asset[] | null] => {
  const isAdultContentEnabled = useIsAdultContentEnabled()

  // always start with this filter to minimize chance of mistakenly showing it
  let filters: string[] = ['isAdult != 1']

  if (filtersByFieldName.category) {
    filters.push(`category: ${filtersByFieldName.category}`)
  }

  if (isAdultContentEnabled) {
    filters = filters.filter(filter => filter !== 'isAdult != 1')
  }

  const [isLoading, isErrored, assetSearchResults] = useAlgoliaSearch(
    Indexes.Assets,
    searchTerm,
    filters.join(' AND ')
  )
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setIsSearching(isLoading))
  }, [isLoading])

  const assets = assetSearchResults
    ? mapAssetSearchResultsToAssets(assetSearchResults)
    : null

  return [isLoading, isErrored, assets]
}
