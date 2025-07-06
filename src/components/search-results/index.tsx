import React, { useCallback, Fragment } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Link from '../../components/link'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import { makeStyles } from '@mui/styles'

import useSearching, { GetQueryFn } from '../../hooks/useSearching'
import useAssetSearch, { ErrorCode } from '../../hooks/useAssetSearch'
import { searchIndexNameLabels, changeSearchTableName } from '../../modules/app'
import * as routes from '../../routes'
import { trackAction } from '../../analytics'
import useIsAdultContentEnabled from '../../hooks/useIsAdultContentEnabled'
import { mediaQueryForMobiles } from '../../media-queries'
import { adultSearchTerms } from '../../config'
import { areasByCategory } from '../../areas'
import categoryMeta, {
  CategoryMeta,
  getCategoryMeta,
} from '../../category-meta'
import { CollectionNames, Species } from '../../modules/species'
import { getPathForQueryString } from '../../queries'

import ErrorMessage from '../error-message'
import AssetResults from '../asset-results'
import AuthorResults from '../author-results'
import NoResultsMessage from '../no-results-message'
import Message from '../message'
import Button from '../button'
import PageControls from '../page-controls'
import UserList from '../user-list'
import SearchFilters from '../search-filters'
import WarningMessage from '../warning-message'
import { AssetCategory } from '../../modules/assets'
import { DataStoreErrorCode } from '../../data-store'
import LoadingIndicator from '../loading-indicator'

import { CollectionNames as UsersCollectionNames } from '../../modules/users'
import { CollectionNames as AuthorsCollectionNames } from '../../modules/authors'
import { CollectionNames as AssetsCollectionNames } from '../../modules/assets'
import useDataStoreItems from '../../hooks/useDataStoreItems'

const useStyles = makeStyles({
  tableButton: {
    margin: '0 0.5rem 0.5rem 0',
  },
  poweredByAlgoliaLogo: {
    marginTop: '1rem',
    fontSize: '300%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waitingForResultsMsg: {
    marginTop: '1rem',
    textAlign: 'center',
  },
  adultContentMessage: {
    textAlign: 'center',
    fontSize: '125%',
  },
  items: {
    display: 'flex',
    [mediaQueryForMobiles]: {
      flexWrap: 'wrap',
    },
  },
  filters: {
    display: 'flex',
    alignItems: 'baseline',
  },
})

function ViewAllAuthorsBtn() {
  return (
    <PageControls>
      <Button
        url={routes.authors}
        onClick={() =>
          trackAction('SearchResults', 'Click view all authors button')
        }>
        View All Authors
      </Button>
    </PageControls>
  )
}

function Results({
  isLoading,
  lastErrorCode,
  tableName,
  hits,
}: {
  isLoading: boolean
  lastErrorCode: ErrorCode | DataStoreErrorCode | null
  tableName: string
  hits: any[]
}) {
  const { searchFilters } = useAppSearch()
  const classes = useStyles()

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>
        Failed to perform search: error code {lastErrorCode}
      </ErrorMessage>
    )
  }

  if (isLoading) {
    return (
      <div className={classes.waitingForResultsMsg}>
        <LoadingIndicator message="Searching..." />
      </div>
    )
  }

  if (!hits.length) {
    return (
      <>
        <NoResultsMessage>
          Nothing found matching your search term
          {tableName === AssetsCollectionNames.Assets && searchFilters.length
            ? ` (${searchFilters.length} filter${
                searchFilters.length > 1 ? 's' : ''
              } applied)`
            : ''}
        </NoResultsMessage>
        {tableName === AuthorsCollectionNames.Authors && <ViewAllAuthorsBtn />}
      </>
    )
  }

  switch (tableName) {
    case AssetsCollectionNames.Assets:
      return (
        <>
          <AssetResults assets={hits} />
          <PoweredByAlgoliaLogo />
          <Button
            color="secondary"
            url={getPathForQueryString(
              hits.map((hit) => `id:${hit.id}`).join(' ')
            )}>
            Export Assets To Query
          </Button>
        </>
      )
    case AuthorsCollectionNames.Authors:
      return (
        <>
          <AuthorResults authors={hits} />
          <ViewAllAuthorsBtn />
        </>
      )
    case UsersCollectionNames.Users:
      return <UserList users={hits} />
    default:
      return (
        <ErrorMessage>Unknown search index to show results for</ErrorMessage>
      )
  }
}

const isSearchTermAdult = (searchTerm: string): boolean => {
  for (const adultSearchTerm of adultSearchTerms) {
    if (searchTerm.includes(adultSearchTerm)) {
      return true
    }
  }

  return false
}

const AdultContentMessage = () => {
  const classes = useStyles()
  return (
    <WarningMessage>
      <strong>Adult content has been disabled by default.</strong> You must
      either <Link to={routes.signUp}>sign up</Link> and enable it in your
      settings or visit our <Link to={routes.nsfw}>NSFW page</Link>
    </WarningMessage>
  )
}

const getSearchStatementForTable = (tableName: string): string => {
  switch (tableName) {
    case AssetsCollectionNames.Assets:
      return `title, description, thumbnailurl, tags, isadult, category`
    case UsersCollectionNames.Users:
      return `username, avatarurl`
    case AuthorsCollectionNames.Authors:
      return `name, avatarurl`
    default:
      throw new Error(
        `Cannot get search statement: table ${tableName} does not exist!`
      )
  }
}

const getFieldsToSearchForTable = (tableName: string): string[] => {
  switch (tableName) {
    case AssetsCollectionNames.Assets:
      return ['title']
    case UsersCollectionNames.Users:
      return ['username']
    case AuthorsCollectionNames.Authors:
      return ['name']
    default:
      throw new Error(
        `Cannot get search statement: table ${tableName} does not exist!`
      )
  }
}

const PoweredByAlgoliaLogo = () => {
  const classes = useStyles()
  return (
    <a
      href="https://www.algolia.com"
      target="_blank"
      rel="noopener noreferrer"
      className={classes.poweredByAlgoliaLogo}>
      <svg height="1.2em" viewBox="0 0 572 64">
        <path
          fill="#FFF"
          d="M16 48.3c-3.4 0-6.3-.6-8.7-1.7A12.4 12.4 0 0 1 1.9 42C.6 40 0 38 0 35.4h6.5a6.7 6.7 0 0 0 3.9 6c1.4.7 3.3 1.1 5.6 1.1 2.2 0 4-.3 5.4-1a7 7 0 0 0 3-2.4 6 6 0 0 0 1-3.4c0-1.5-.6-2.8-1.9-3.7-1.3-1-3.3-1.6-5.9-1.8l-4-.4c-3.7-.3-6.6-1.4-8.8-3.4a10 10 0 0 1-3.3-7.9c0-2.4.6-4.6 1.8-6.4a12 12 0 0 1 5-4.3c2.2-1 4.7-1.6 7.5-1.6s5.5.5 7.6 1.6a12 12 0 0 1 5 4.4c1.2 1.8 1.8 4 1.8 6.7h-6.5a6.4 6.4 0 0 0-3.5-5.9c-1-.6-2.6-1-4.4-1s-3.2.3-4.4 1c-1.1.6-2 1.4-2.6 2.4-.5 1-.8 2-.8 3.1a5 5 0 0 0 1.5 3.6c1 1 2.6 1.7 4.7 1.9l4 .3c2.8.2 5.2.8 7.2 1.8 2.1 1 3.7 2.2 4.9 3.8a9.7 9.7 0 0 1 1.7 5.8c0 2.5-.7 4.7-2 6.6a13 13 0 0 1-5.6 4.4c-2.4 1-5.2 1.6-8.4 1.6Zm35.6 0c-2.6 0-4.8-.4-6.7-1.3a13 13 0 0 1-4.7-3.5 17.1 17.1 0 0 1-3.6-10.4v-1c0-2 .3-3.8 1-5.6a13 13 0 0 1 7.3-8.3 15 15 0 0 1 6.3-1.4A13.2 13.2 0 0 1 64 24.3c1 2.2 1.6 4.6 1.6 7.2V34H39.4v-4.3h21.8l-1.8 2.2c0-2-.3-3.7-.9-5.1a7.3 7.3 0 0 0-2.7-3.4c-1.2-.7-2.7-1.1-4.6-1.1s-3.4.4-4.7 1.3a8 8 0 0 0-2.9 3.6c-.6 1.5-.9 3.3-.9 5.4 0 2 .3 3.7 1 5.3a7.9 7.9 0 0 0 2.8 3.7c1.3.8 3 1.3 5 1.3s3.8-.5 5.1-1.3c1.3-1 2.1-2 2.4-3.2h6a11.8 11.8 0 0 1-7 8.7 16 16 0 0 1-6.4 1.2ZM80 48c-2.2 0-4-.3-5.7-1a8.4 8.4 0 0 1-3.7-3.3 9.7 9.7 0 0 1-1.3-5.2c0-2 .5-3.8 1.5-5.2a9 9 0 0 1 4.3-3.1c1.8-.7 4-1 6.7-1H89v4.1h-7.5c-2 0-3.4.5-4.4 1.4-1 1-1.6 2.1-1.6 3.6s.5 2.7 1.6 3.6c1 1 2.5 1.4 4.4 1.4 1.1 0 2.2-.2 3.2-.7 1-.4 1.9-1 2.6-2 .6-1 1-2.4 1-4.2l1.7 2.1c-.2 2-.7 3.8-1.5 5.2a9 9 0 0 1-3.4 3.3 12 12 0 0 1-5.3 1Zm9.5-.7v-8.8h-1v-10c0-1.8-.5-3.2-1.4-4.1-1-1-2.4-1.4-4.2-1.4a142.9 142.9 0 0 0-10.2.4v-5.6a74.8 74.8 0 0 1 8.6-.4c3 0 5.5.4 7.5 1.2s3.4 2 4.4 3.6c1 1.7 1.4 4 1.4 6.7v18.4h-5Zm12.9 0V17.8h5v12.3h-.2c0-4.2 1-7.4 2.8-9.5a11 11 0 0 1 8.3-3.1h1v5.6h-2a9 9 0 0 0-6.3 2.2c-1.5 1.5-2.2 3.6-2.2 6.4v15.6h-6.4Zm34.4 1a15 15 0 0 1-6.6-1.3c-1.9-.9-3.4-2-4.7-3.5a15.5 15.5 0 0 1-2.7-5c-.6-1.7-1-3.6-1-5.4v-1c0-2 .4-3.8 1-5.6a15 15 0 0 1 2.8-4.9c1.3-1.5 2.8-2.6 4.6-3.5a16.4 16.4 0 0 1 13.3.2c2 1 3.5 2.3 4.8 4a12 12 0 0 1 2 6H144c-.2-1.6-1-3-2.2-4.1a7.5 7.5 0 0 0-5.2-1.7 8 8 0 0 0-4.7 1.3 8 8 0 0 0-2.8 3.6 13.8 13.8 0 0 0 0 10.3c.6 1.5 1.5 2.7 2.8 3.6s2.8 1.3 4.8 1.3c1.5 0 2.7-.2 3.8-.8a7 7 0 0 0 2.6-2c.7-1 1-2 1.2-3.2h6.2a11 11 0 0 1-2 6.2 15.1 15.1 0 0 1-11.8 5.5Zm19.7-1v-40h6.4V31h-1.3c0-3 .4-5.5 1.1-7.6a9.7 9.7 0 0 1 3.5-4.8A9.9 9.9 0 0 1 172 17h.3c3.5 0 6 1.1 7.9 3.5 1.7 2.3 2.6 5.7 2.6 10v16.8h-6.4V29.6c0-2.1-.6-3.8-1.8-5a6.4 6.4 0 0 0-4.8-1.8c-2 0-3.7.7-5 2a7.8 7.8 0 0 0-1.9 5.5v17h-6.4Zm63.8 1a12.2 12.2 0 0 1-10.9-6.2 19 19 0 0 1-1.8-7.3h1.4v12.5h-5.1v-40h6.4v19.8l-2 3.5c.2-3.1.8-5.7 1.9-7.7a11 11 0 0 1 4.4-4.5c1.8-1 3.9-1.5 6.1-1.5a13.4 13.4 0 0 1 12.8 9.1c.7 1.9 1 3.8 1 6v1c0 2.2-.3 4.1-1 6a13.6 13.6 0 0 1-13.2 9.4Zm-1.2-5.5a8.4 8.4 0 0 0 7.9-5c.7-1.5 1.1-3.3 1.1-5.3s-.4-3.8-1.1-5.3a8.7 8.7 0 0 0-3.2-3.6 9.6 9.6 0 0 0-9.2-.2 8.5 8.5 0 0 0-3.3 3.2c-.8 1.4-1.3 3-1.3 5v2.3a9 9 0 0 0 1.3 4.8 9 9 0 0 0 3.4 3c1.4.7 2.8 1 4.4 1Zm27.3 3.9-10-28.9h6.5l9.5 28.9h-6Zm-7.5 12.2v-5.7h4.9c1 0 2-.1 2.9-.4a4 4 0 0 0 2-1.4c.4-.7.9-1.6 1.2-2.7l8.6-30.9h6.2l-9.3 32.4a14 14 0 0 1-2.5 5 8.9 8.9 0 0 1-4 2.8c-1.5.6-3.4.9-5.6.9h-4.4Zm9-12.2v-5.2h6.4v5.2H248Z"
        />
        <path
          fill="#FFF"
          d="M534.4 9.1H528a.8.8 0 0 1-.7-.7V1.8c0-.4.2-.7.6-.8l6.5-1c.4 0 .8.2.9.6v7.8c0 .4-.4.7-.8.7zM428 35.2V.8c0-.5-.3-.8-.7-.8h-.2l-6.4 1c-.4 0-.7.4-.7.8v35c0 1.6 0 11.8 12.3 12.2.5 0 .8-.4.8-.8V43c0-.4-.3-.7-.6-.8-4.5-.5-4.5-6-4.5-7zm106.5-21.8H528c-.4 0-.7.4-.7.8v34c0 .4.3.8.7.8h6.5c.4 0 .8-.4.8-.8v-34c0-.5-.4-.8-.8-.8zm-17.7 21.8V.8c0-.5-.3-.8-.8-.8l-6.5 1c-.4 0-.7.4-.7.8v35c0 1.6 0 11.8 12.3 12.2.4 0 .8-.4.8-.8V43c0-.4-.3-.7-.7-.8-4.4-.5-4.4-6-4.4-7zm-22.2-20.6a16.5 16.5 0 0 1 8.6 9.3c.8 2.2 1.3 4.8 1.3 7.5a19.4 19.4 0 0 1-4.6 12.6 14.8 14.8 0 0 1-5.2 3.6c-2 .9-5.2 1.4-6.8 1.4a21 21 0 0 1-6.7-1.4 15.4 15.4 0 0 1-8.6-9.3 21.3 21.3 0 0 1 0-14.4 15.2 15.2 0 0 1 8.6-9.3c2-.8 4.3-1.2 6.7-1.2s4.6.4 6.7 1.2zm-6.7 27.6c2.7 0 4.7-1 6.2-3s2.2-4.3 2.2-7.8-.7-6.3-2.2-8.3-3.5-3-6.2-3-4.7 1-6.1 3c-1.5 2-2.2 4.8-2.2 8.3s.7 5.8 2.2 7.8 3.5 3 6.2 3zm-88.8-28.8c-6.2 0-11.7 3.3-14.8 8.2a18.6 18.6 0 0 0 4.8 25.2c1.8 1.2 4 1.8 6.2 1.7s.1 0 .1 0h.9c4.2-.7 8-4 9.1-8.1v7.4c0 .4.3.7.8.7h6.4a.7.7 0 0 0 .7-.7V14.2c0-.5-.3-.8-.7-.8h-13.5zm6.3 26.5a9.8 9.8 0 0 1-5.7 2h-.5a10 10 0 0 1-9.2-14c1.4-3.7 5-6.3 9-6.3h6.4v18.3zm152.3-26.5h13.5c.5 0 .8.3.8.7v33.7c0 .4-.3.7-.8.7h-6.4a.7.7 0 0 1-.8-.7v-7.4c-1.2 4-4.8 7.4-9 8h-.1a4.2 4.2 0 0 1-.5.1h-.9a10.3 10.3 0 0 1-7-2.6c-4-3.3-6.5-8.4-6.5-14.2 0-3.7 1-7.2 3-10 3-5 8.5-8.3 14.7-8.3zm.6 28.4c2.2-.1 4.2-.6 5.7-2V21.7h-6.3a9.8 9.8 0 0 0-9 6.4 10.2 10.2 0 0 0 9.1 13.9h.5zM452.8 13.4c-6.2 0-11.7 3.3-14.8 8.2a18.5 18.5 0 0 0 3.6 24.3 10.4 10.4 0 0 0 13 .6c2.2-1.5 3.8-3.7 4.5-6.1v7.8c0 2.8-.8 5-2.2 6.3-1.5 1.5-4 2.2-7.5 2.2l-6-.3c-.3 0-.7.2-.8.5l-1.6 5.5c-.1.4.1.8.5 1h.1c2.8.4 5.5.6 7 .6 6.3 0 11-1.4 14-4.1 2.7-2.5 4.2-6.3 4.5-11.4V14.2c0-.5-.4-.8-.8-.8h-13.5zm6.3 8.2v18.3a9.6 9.6 0 0 1-5.6 2h-1a10.3 10.3 0 0 1-8.8-14c1.4-3.7 5-6.3 9-6.3h6.4zM291 31.5A32 32 0 0 1 322.8 0h30.8c.6 0 1.2.5 1.2 1.2v61.5c0 1.1-1.3 1.7-2.2 1l-19.2-17a18 18 0 0 1-11 3.4 18.1 18.1 0 1 1 18.2-14.8c-.1.4-.5.7-.9.6-.1 0-.3 0-.4-.2l-3.8-3.4c-.4-.3-.6-.8-.7-1.4a12 12 0 1 0-2.4 8.3c.4-.4 1-.5 1.6-.2l14.7 13.1v-46H323a26 26 0 1 0 10 49.7c.8-.4 1.6-.2 2.3.3l3 2.7c.3.2.3.7 0 1l-.2.2a32 32 0 0 1-47.2-28.6z"
        />
      </svg>
    </a>
  )
}

function IndexFilters() {
  // @ts-ignore
  const { searchTableName } = useSelector(({ app: { searchTableName } }) => ({
    searchTableName,
  }))
  const dispatch = useDispatch()
  const classes = useStyles()

  const onClickWithTableName = (newTableName: string) => {
    dispatch(changeSearchTableName(newTableName))
  }

  return (
    <div className={classes.filters}>
      {Object.entries(searchIndexNameLabels).map(([tableName, label]) => {
        const isSelected = searchTableName === tableName
        return (
          <Button
            key={tableName}
            className={classes.tableButton}
            onClick={() => onClickWithTableName(tableName)}
            icon={isSelected ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />}
            size="small">
            {label}
          </Button>
        )
      })}
    </div>
  )
}

const getQueryForTagAndCategory = (tagName: string, categoryName: string) =>
  `${tagName}%20category%3A${categoryName}`

const minLengthToSuggest = 3

const TagSearchHint = ({ searchTerm }: { searchTerm: string }) => {
  // only try single word matches
  if (
    !searchTerm ||
    searchTerm.includes(' ') ||
    searchTerm.length < minLengthToSuggest
  ) {
    return null
  }

  if (searchTerm.toLowerCase() === 'free') {
    return (
      <Message>
        Do you want to find all assets tagged{' '}
        <Link to={routes.viewTagWithVar.replace(':tag', 'free')}>free</Link>?
      </Message>
    )
  }

  const matches = []

  for (const [categoryName, areas] of Object.entries(areasByCategory)) {
    for (const [areaName, { namePlural, tags }] of Object.entries(areas)) {
      if (tags.includes(searchTerm)) {
        matches.push({
          categoryName,
          areaName,
          areaNamePlural: namePlural,
          tagName: searchTerm,
        })
      }
    }
  }

  if (!matches.length) {
    return null
  }

  return (
    <Message>
      Did you want to search by tag{' '}
      {matches.map(({ categoryName, areaName, areaNamePlural, tagName }) => (
        <span key={categoryName}>
          <Link
            to={routes.queryWithVar.replace(
              ':query',
              getQueryForTagAndCategory(tagName, categoryName)
            )}>
            {tagName}
          </Link>{' '}
          in{' '}
          <Link
            to={routes.viewAreaWithVar
              .replace(':categoryName', categoryName)
              .replace(':areaName', areaName)}>
            {categoryMeta[categoryName].name}/{areaNamePlural}
          </Link>
        </span>
      ))}
    </Message>
  )
}

const CategoryAndSpeciesSearchHint = ({
  searchTerm,
}: {
  searchTerm: string
}) => {
  const [, , species] = useDataStoreItems<Species>(CollectionNames.Species)

  const searchTermLower = searchTerm.toLowerCase().trim()

  if (searchTerm.length < minLengthToSuggest) {
    return null
  }

  let suggestedCategory: CategoryMeta | null = null

  for (const categoryName in categoryMeta) {
    const category = getCategoryMeta(categoryName as AssetCategory)

    if (
      category.name.toLowerCase().includes(searchTermLower) ||
      category.nameSingular.toLowerCase().includes(searchTermLower)
    ) {
      suggestedCategory = category
    }
  }

  let suggestedSpecies: Species | null = null

  if (species) {
    for (const speciesItem of species) {
      if (
        speciesItem.singularname.toLowerCase().includes(searchTermLower) ||
        speciesItem.pluralname.toLowerCase().includes(searchTermLower)
      ) {
        suggestedSpecies = speciesItem
      }
    }
  }

  if (!suggestedCategory && !suggestedSpecies) {
    return null
  }

  return (
    <Message>
      Did you mean{' '}
      {suggestedCategory ? (
        <>
          category{' '}
          <Link
            to={routes.viewCategoryWithVar.replace(
              ':categoryName',
              suggestedCategory.id
            )}>
            {suggestedCategory.name}
          </Link>
        </>
      ) : null}
      {suggestedSpecies ? (
        <>
          {suggestedCategory ? ` or ` : ''} species{' '}
          <Link
            to={routes.viewSpeciesWithVar.replace(
              ':speciesIdOrSlug',
              suggestedSpecies.id
            )}>
            {suggestedSpecies.pluralname}
          </Link>
        </>
      ) : null}
      ?
    </Message>
  )
}

const useAppSearch = (): {
  searchTerm: string
  searchTableName: string
  searchFilters: string[]
  searchCount: number
} => {
  const { searchTerm, searchTableName, searchFilters, searchCount } =
    useSelector(
      ({
        // @ts-ignore
        app: { searchTerm, searchTableName, searchFilters, searchCount },
      }) => ({
        searchTerm,
        searchTableName,
        searchFilters,
        searchCount,
      })
    )

  return {
    searchTerm,
    searchTableName,
    searchFilters,
    searchCount,
  }
}

const AssetSearch = () => {
  const { searchTerm, searchFilters } = useAppSearch()

  const filtersByFieldName = searchFilters.reduce<{
    [fieldName: string]: string[]
  }>((result, searchFilterStr) => {
    const fieldName = searchFilterStr.split(':')[0]
    const fieldValue = searchFilterStr.split(':')[1]

    if (result[fieldName]) {
      result[fieldName] = result[fieldName].concat([fieldValue])
    } else {
      result[fieldName] = [fieldValue]
    }

    return result
  }, {})

  const [isLoading, lastErrorCode, hits, usingSimpleSearch] = useAssetSearch(
    searchTerm,
    filtersByFieldName,
    200 // "Rexouium" has 153 results as of Oct 2022
  )

  return (
    <>
      {usingSimpleSearch ? (
        <WarningMessage hideId="using-simple-search">
          Our search provider Algolia is currently unavailable. Falling back to
          a worse search. The search results you see might not be as good.
        </WarningMessage>
      ) : null}
      <CategoryAndSpeciesSearchHint searchTerm={searchTerm} />
      <TagSearchHint searchTerm={searchTerm} />
      <Results
        isLoading={isLoading}
        lastErrorCode={lastErrorCode}
        tableName={AssetsCollectionNames.Assets}
        hits={hits || []}
      />
    </>
  )
}

const NonAssetSearch = () => {
  const { searchTerm, searchTableName, searchFilters, searchCount } =
    useAppSearch()
  const isAdultContentEnabled = useIsAdultContentEnabled()

  const getQuery = useCallback<GetQueryFn<any>>(
    (query) => {
      if (searchTableName !== AssetsCollectionNames.Assets) {
        return query
      }

      query =
        isAdultContentEnabled === false ? query.is('isadult', false) : query

      const filtersByFieldName = searchFilters.reduce<{
        [fieldName: string]: string[]
      }>((result, searchFilterStr) => {
        const fieldName = searchFilterStr.split(':')[0]
        const fieldValue = searchFilterStr.split(':')[1]

        if (result[fieldName]) {
          result[fieldName] = result[fieldName].concat([fieldValue])
        } else {
          result[fieldName] = [fieldValue]
        }

        return result
      }, {})

      for (const [fieldName, values] of Object.entries(filtersByFieldName)) {
        query = query.or(
          values.map((value) => `${fieldName}.eq.${value}`).join(',')
        )
      }

      return query
    },
    [
      searchTableName,
      isAdultContentEnabled,
      searchFilters.join(','),
      searchCount,
    ]
  )
  const [isLoading, lastErrorCode, hits] = useSearching<any>(
    searchTableName,
    searchTerm,
    getSearchStatementForTable(searchTableName),
    getFieldsToSearchForTable(searchTableName),
    getQuery
  )

  return (
    <Results
      isLoading={isLoading}
      lastErrorCode={lastErrorCode}
      tableName={searchTableName}
      hits={hits || []}
    />
  )
}

export default () => {
  const { searchTerm, searchTableName } = useSelector(
    // @ts-ignore
    ({ app: { searchTerm, searchTableName } }) => ({
      searchTerm,
      searchTableName,
    })
  )
  const isAdultContentEnabled = useIsAdultContentEnabled()
  const classes = useStyles()

  return (
    <>
      <div className={classes.items}>
        {searchTableName === AssetsCollectionNames.Assets ? (
          <SearchFilters />
        ) : (
          <div style={{ width: '100%' }} />
        )}
        <IndexFilters />
      </div>
      {isSearchTermAdult(searchTerm) && !isAdultContentEnabled ? (
        <AdultContentMessage />
      ) : null}
      {searchTableName === AssetsCollectionNames.Assets ? (
        <>
          <AssetSearch />
        </>
      ) : (
        <NonAssetSearch />
      )}
    </>
  )
}
