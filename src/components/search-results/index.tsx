import React, { useCallback, Fragment } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Link from '../../components/link'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import { makeStyles } from '@material-ui/core/styles'

import useSearching from '../../hooks/useSearching'
import useAssetSearch from '../../hooks/useAssetSearch'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import AssetResults from '../asset-results'
import AuthorResults from '../author-results'
import NoResultsMessage from '../no-results-message'
import Message from '../message'
import Button from '../button'
import PageControls from '../page-controls'
import UserList from '../user-list'
import SearchFilters from '../search-filters'
import Heading from '../heading'

import { searchIndexNameLabels, changeSearchTableName } from '../../modules/app'
import * as routes from '../../routes'
import { trackAction } from '../../analytics'
import {
  AssetFieldNames,
  AuthorFieldNames,
  CollectionNames,
  UserFieldNames,
  AssetCategories
} from '../../hooks/useDatabaseQuery'
import useIsAdultContentEnabled from '../../hooks/useIsAdultContentEnabled'
import { mediaQueryForMobiles } from '../../media-queries'
import { adultSearchTerms } from '../../config'
import { areasByCategory } from '../../areas'
import categoryMeta, { Category } from '../../category-meta'
import useSpecies from '../../hooks/useSpecies'
import { Species } from '../../modules/species'
import { Asset } from '../../modules/assets'

const useStyles = makeStyles({
  tableWrapper: {
    position: 'relative'
  },
  tables: {
    display: 'flex',
    position: 'absolute',
    top: 0,
    right: 0,
    [mediaQueryForMobiles]: {
      position: 'relative'
    }
  },
  tableButton: {
    margin: '0 0.5rem 0.5rem 0'
  },
  waitingForResultsMsg: {
    marginTop: '1rem',
    textAlign: 'center'
  },
  adultContentMessage: {
    textAlign: 'center',
    fontSize: '125%'
  }
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

interface AssetHit extends Asset {
  rank: number
}

const reduceAssetResultsIntoBestAndWorst = (hits: AssetHit[]) =>
  hits.reduce<{ best: AssetHit[]; worst: AssetHit[] }>(
    (hitsByScore, hit) => ({
      best: hit.rank >= 0.5 ? hitsByScore.best.concat([hit]) : hitsByScore.best,
      worst:
        hit.rank < 0.5 ? hitsByScore.worst.concat([hit]) : hitsByScore.worst
    }),
    { best: [], worst: [] }
  )

// avatars are more "important" to people so always display them first
const sortAssetsByAvatarsFirst = (assets: AssetHit[]): AssetHit[] =>
  assets.sort((assetA, assetB) => {
    if (assetA.category === AssetCategories.avatar) {
      return -1
    }
    if (assetB.category === AssetCategories.avatar) {
      return 1
    }
    return 0
  })

function Results({
  isLoading,
  isErrored,
  tableName,
  hits
}: {
  isLoading: boolean
  isErrored: boolean
  tableName: string
  hits: any[]
}) {
  const { searchFilters } = useAppSearch()
  const classes = useStyles()

  if (isLoading && hits.length === 0) {
    return (
      <div className={classes.waitingForResultsMsg}>Waiting for results...</div>
    )
  }

  if (isErrored) {
    return <ErrorMessage>Failed to perform search</ErrorMessage>
  }

  if (!hits.length) {
    return (
      <>
        <NoResultsMessage>
          Nothing found matching your search term
          {searchFilters.length
            ? ` (${searchFilters.length} filter${
                searchFilters.length > 1 ? 's' : ''
              } applied)`
            : ''}
        </NoResultsMessage>
        {tableName === CollectionNames.Authors && <ViewAllAuthorsBtn />}
      </>
    )
  }

  switch (tableName) {
    case CollectionNames.Assets:
      let { best, worst } = reduceAssetResultsIntoBestAndWorst(hits)
      best = sortAssetsByAvatarsFirst(best)
      worst = sortAssetsByAvatarsFirst(worst)

      return (
        <>
          {best.length ? (
            <AssetResults showCost assets={best} showCategory />
          ) : null}
          {worst.length ? (
            <>
              {best.length ? (
                <Heading variant="h2">More Results</Heading>
              ) : null}
              <AssetResults
                showCost
                assets={worst}
                showAddToCart
                showCategory
              />
            </>
          ) : null}
        </>
      )
    case CollectionNames.Authors:
      return (
        <>
          <AuthorResults authors={hits} />
          <ViewAllAuthorsBtn />
        </>
      )
    case CollectionNames.Users:
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
    <Message>
      <div className={classes.adultContentMessage}>
        <strong>Adult content has been disabled by default.</strong> You must
        either <Link to={routes.signUp}>sign up</Link> and enable it in your
        settings or visit our <Link to={routes.nsfw}>NSFW page</Link>
      </div>
    </Message>
  )
}

const getSearchStatementForTable = (tableName: string): string => {
  switch (tableName) {
    case CollectionNames.Assets:
      return `${AssetFieldNames.title}, ${AssetFieldNames.description}, ${
        AssetFieldNames.thumbnailUrl
      }, ${AssetFieldNames.tags}, ${AssetFieldNames.isAdult}, ${
        AssetFieldNames.category
      }`
    case CollectionNames.Users:
      return `${UserFieldNames.username}, ${UserFieldNames.avatarUrl}`
    case CollectionNames.Authors:
      return `${AuthorFieldNames.name}, ${AuthorFieldNames.avatarUrl}`
    default:
      throw new Error(
        `Cannot get search statement: table ${tableName} does not exist!`
      )
  }
}

const getFieldsToSearchForTable = (tableName: string): string[] => {
  switch (tableName) {
    case CollectionNames.Assets:
      return [AssetFieldNames.title]
    case CollectionNames.Users:
      return [UserFieldNames.username]
    case CollectionNames.Authors:
      return [AuthorFieldNames.name]
    default:
      throw new Error(
        `Cannot get search statement: table ${tableName} does not exist!`
      )
  }
}

function IndexFilters() {
  // @ts-ignore
  const { searchTableName } = useSelector(({ app: { searchTableName } }) => ({
    searchTableName
  }))
  const dispatch = useDispatch()
  const classes = useStyles()

  const onClickWithTableName = (newTableName: string) => {
    dispatch(changeSearchTableName(newTableName))
  }

  return (
    <div className={classes.tableWrapper}>
      <div className={classes.tables}>
        {Object.entries(searchIndexNameLabels).map(([tableName, label]) => {
          const isSelected = searchTableName === tableName
          return (
            <Button
              key={tableName}
              className={classes.tableButton}
              onClick={() => onClickWithTableName(tableName)}
              icon={
                isSelected ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />
              }>
              {label}
            </Button>
          )
        })}
      </div>
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

  const matches = []

  for (const [categoryName, areas] of Object.entries(areasByCategory)) {
    for (const [areaName, { namePlural, tags }] of Object.entries(areas)) {
      if (tags.includes(searchTerm)) {
        matches.push({
          categoryName,
          areaName,
          areaNamePlural: namePlural,
          tagName: searchTerm
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
  searchTerm
}: {
  searchTerm: string
}) => {
  const [species] = useSpecies()

  const searchTermLower = searchTerm.toLowerCase().trim()

  if (searchTerm.length < minLengthToSuggest) {
    return null
  }

  let suggestedCategory: Category | null = null

  for (const categoryName in categoryMeta) {
    const category = categoryMeta[categoryName]

    if (
      category.name.toLowerCase().includes(searchTermLower) ||
      category.nameSingular.toLowerCase().includes(searchTermLower)
    ) {
      suggestedCategory = category
    }
  }

  let suggestedSpecies: Species | null = null

  for (const speciesItem of species) {
    if (
      speciesItem.singularname.toLowerCase().includes(searchTermLower) ||
      speciesItem.pluralname.toLowerCase().includes(searchTermLower)
    ) {
      suggestedSpecies = speciesItem
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
  const {
    searchTerm,
    searchTableName,
    searchFilters,
    searchCount
  } = useSelector(
    // @ts-ignore
    ({ app: { searchTerm, searchTableName, searchFilters, searchCount } }) => ({
      searchTerm,
      searchTableName,
      searchFilters,
      searchCount
    })
  )

  return {
    searchTerm,
    searchTableName,
    searchFilters,
    searchCount
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

  const [isLoading, isErrored, hits] = useAssetSearch(
    searchTerm,
    filtersByFieldName,
    200 // "Rexouium" has 153 results as of Oct 2022
  )

  return (
    <>
      <CategoryAndSpeciesSearchHint searchTerm={searchTerm} />
      <TagSearchHint searchTerm={searchTerm} />
      <Results
        isLoading={isLoading}
        isErrored={isErrored}
        tableName={CollectionNames.Assets}
        hits={hits || []}
      />
    </>
  )
}

const NonAssetSearch = () => {
  const {
    searchTerm,
    searchTableName,
    searchFilters,
    searchCount
  } = useAppSearch()
  const isAdultContentEnabled = useIsAdultContentEnabled()

  const getQuery = useCallback(
    query => {
      if (searchTableName !== CollectionNames.Assets) {
        return query
      }

      query =
        isAdultContentEnabled === false
          ? query.is(AssetFieldNames.isAdult, false)
          : query

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
          values.map(value => `${fieldName}.eq.${value}`).join(',')
        )
      }

      return query
    },
    [
      searchTableName,
      isAdultContentEnabled,
      searchFilters.join(','),
      searchCount
    ]
  )
  const [isLoading, isErrored, hits] = useSearching<any[]>(
    searchTableName,
    searchTerm,
    getSearchStatementForTable(searchTableName),
    getFieldsToSearchForTable(searchTableName),
    getQuery
  )

  return (
    <Results
      isLoading={isLoading}
      isErrored={isErrored}
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
      searchTableName
    })
  )
  const isAdultContentEnabled = useIsAdultContentEnabled()

  return (
    <>
      <IndexFilters />
      {isSearchTermAdult(searchTerm) && !isAdultContentEnabled ? (
        <AdultContentMessage />
      ) : null}
      <SearchFilters />
      {searchTableName === CollectionNames.Assets ? (
        <AssetSearch />
      ) : (
        <NonAssetSearch />
      )}
    </>
  )
}
