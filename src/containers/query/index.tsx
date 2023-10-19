import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router'
import { makeStyles } from '@material-ui/core/styles'
import { PostgrestFilterBuilder } from '@supabase/postgrest-js'
import { Helmet } from 'react-helmet'

import BigSearchInput from '../../components/big-search-input'
import * as routes from '../../routes'
import {
  convertSearchTermToUrlPath,
  getIsUuid,
  parseSearchTermFromUrlPath
} from '../../utils'
import useIsAdultContentEnabled from '../../hooks/useIsAdultContentEnabled'
import {
  AssetFieldNames,
  AssetMetaFieldNames,
  AuthorFieldNames,
  SpeciesFieldNames,
  UserFieldNames
} from '../../hooks/useDatabaseQuery'
import AssetResults from '../../components/asset-results'
import PaginatedView from '../../components/paginated-view'
import { CollectionNames, FullAsset, PublicAsset } from '../../modules/assets'
import { query } from '../../data-store'
import { CollectionNames as AuthorCollectionNames } from '../../modules/authors'
import { CollectionNames as UserCollectionNames } from '../../modules/users'
import { CollectionNames as SpeciesCollectionNames } from '../../modules/species'
import Link from '../../components/link'
import { handleError } from '../../error-handling'
import ErrorMessage from '../../components/error-message'
import Message from '../../components/message'
import WarningMessage from '../../components/warning-message'
import useDataStore from '../../hooks/useDataStore'
import { client as supabase } from '../../supabase'

const useStyles = makeStyles(theme => ({
  root: {
    position: 'relative'
  },
  totalCount: {
    position: 'absolute',
    top: 0,
    right: 0
  },
  operations: {
    display: 'flex',
    height: '32px',
    marginBottom: '0.5rem'
  },
  operation: {
    marginRight: '0.5rem'
  },
  tagTextField: {
    '& input': {
      padding: '5px'
    }
  },
  autocompleteList: {
    position: 'absolute',
    zIndex: 50,
    width: '50vw',
    marginTop: '0.5rem',
    backgroundColor: theme.palette.background.paper
  },
  autocompleteSuggestion: {
    padding: '0.25rem',
    '&:hover': {
      cursor: 'pointer',
      backgroundColor: 'rgba(255, 255, 255, 0.1)'
    }
  }
}))

const updateQueryStringInUrl = (newQueryString: string): void => {
  const queryStringToInsert = convertSearchTermToUrlPath(newQueryString)
  console.debug(`Query.updateQueryStringInUrl`, {
    newQueryString,
    queryStringToInsert
  })
  window.history.replaceState(
    null,
    'Search',
    routes.queryWithVar.replace(':query', queryStringToInsert)
  )
}

export enum Operator {
  HAS,
  OR,
  MINUS,
  WILDCARD,
  FILTER,
  SORT
}

export interface Operation {
  fieldName: keyof FullAsset
  operator: Operator
  value: string | string[]
}

export const sortableFieldMap = {
  created: AssetFieldNames.createdAt,
  // updated: AssetFieldNames.lastModifiedAt,
  approved: AssetMetaFieldNames.approvedAt
}

export enum Platforms {
  gumroad,
  booth,
  github
}

const getFieldNameFromSortField = (fieldName: string): keyof FullAsset => {
  if (fieldName in sortableFieldMap) {
    // @ts-ignore
    return sortableFieldMap[fieldName] as keyof FullAsset
  }
  throw new Error(`Unknown field "${fieldName}" to sort by`)
}

const getChunksFromUserInput = (input: string): string[] => {
  const keywords = []
  let inQuotes = false
  let currentKeyword = ''

  for (let i = 0; i < input.length; i++) {
    const char = input[i]

    if (char === ' ' && !inQuotes) {
      if (currentKeyword.length > 0) {
        keywords.push(currentKeyword)
        currentKeyword = ''
      }
    } else if (char === '"') {
      inQuotes = !inQuotes
    } else {
      currentKeyword += char
    }
  }

  if (currentKeyword.length > 0) {
    keywords.push(currentKeyword)
  }

  return keywords
}

class InvalidUserInputError extends Error {}

export const getOperationsFromUserInput = (userInput: string): Operation[] => {
  const chunks = getChunksFromUserInput(userInput)

  if (!chunks) {
    throw new InvalidUserInputError('User input does not match regex')
  }

  console.debug(`Query.start`, { userInput, chunks })

  const operations: Operation[] = []

  for (const chunk of chunks) {
    if (chunk[0] === '~') {
      operations.push({
        fieldName: 'tags',
        operator: Operator.OR,
        value: chunk.slice(1)
      })
    } else if (chunk[0] === '-') {
      operations.push({
        fieldName: 'tags',
        operator: Operator.MINUS,
        value: chunk.slice(1)
      })
      // } else if (chunk.includes('*')) {
      //   operations.push({
      //     fieldName: 'tags',
      //     operator: Operator.WILDCARD,
      //     value: chunk
      //   })
    } else if (chunk.includes('sort:')) {
      const subChunks = chunk.split(':')
      operations.push({
        fieldName: getFieldNameFromSortField(subChunks[1]),
        operator: Operator.SORT,
        value: subChunks[2]
      })
    } else if (chunk.includes('user:')) {
      operations.push({
        fieldName: 'createdby',
        operator: Operator.FILTER,
        value: chunk.replace('user:', '')
      })
    } else if (chunk.includes('author:')) {
      operations.push({
        fieldName: 'author',
        operator: Operator.FILTER,
        value: chunk.replace('author:', '')
      })
    } else if (chunk.includes('category:')) {
      operations.push({
        fieldName: 'category',
        operator: Operator.FILTER,
        value: chunk.replace('category:', '')
      })
    } else if (chunk.includes('species:')) {
      operations.push({
        fieldName: 'species',
        operator: Operator.HAS,
        value: chunk.replace('species:', '')
      })
    } else if (chunk.includes('source:')) {
      operations.push({
        fieldName: 'sourceurl',
        operator: Operator.WILDCARD,
        value: chunk.replace('source:', '')
      })
      // } else if (chunk.includes('approved:')) {
      //   operations.push({
      //     fieldName: 'approvedby',
      //     operator: Operator.FILTER,
      //     value: chunk.replace('approved:', '')
      //   })
      // } else if (chunk.includes('parent:')) {
      //   operations.push({
      //     fieldName: 'relations',
      //     operator: Operator.FILTER,
      //     value: chunk.replace('parent:', '')
      //   })
    } else {
      operations.push({
        fieldName: 'tags',
        operator: Operator.HAS,
        value: chunk
      })
    }
  }

  let orOperation: Operation | null = null

  const mergedOperations = operations.reduce<Operation[]>(
    (results, operation, idx) => {
      if (operation.operator === Operator.OR) {
        if (!orOperation) {
          orOperation = {
            ...operation,
            value: [operation.value as string]
          }
        } else {
          orOperation = {
            ...orOperation,
            // @ts-ignore
            value: orOperation.value.concat([operation.value])
          }
        }
        return results
      }

      return [...results, operation]
    },
    []
  )

  if (orOperation) {
    mergedOperations.push(orOperation)
  }

  return mergedOperations
}

const getCollectionNameForFieldName = (fieldName: string) => {
  switch (fieldName) {
    case 'author':
      return AuthorCollectionNames.Authors
    case 'species':
      return SpeciesCollectionNames.Species
    case 'createdby':
    case 'lastmodifiedby':
      return UserCollectionNames.Users
    default:
      return null
  }
}

const getColumnNameForFieldName = (fieldName: string) => {
  switch (fieldName) {
    case 'author':
      return AuthorFieldNames.name
    case 'species':
      return SpeciesFieldNames.pluralName
    case 'createdby':
    case 'lastmodifiedby':
      return UserFieldNames.username
    default:
      throw new Error(`Cannot get column name for field name "${fieldName}"`)
  }
}

class CouldNotFindIdError extends Error {}

const getIdIfNotId = async (
  idOrName: string,
  fieldName: string
): Promise<string> => {
  if (getIsUuid(idOrName)) {
    return idOrName
  }

  const collectionName = getCollectionNameForFieldName(fieldName)

  if (!collectionName) {
    return idOrName
  }

  const columnName = getColumnNameForFieldName(fieldName)

  console.debug(`Query.getID`, { collectionName, columnName, name: idOrName })

  const { data: results } = await query<{ id: string }>(collectionName, '*', {
    [columnName]: idOrName
  })

  console.debug(`Query.getID.result`, { results })

  if (results === null || results.length !== 1) {
    throw new CouldNotFindIdError(
      `Could not find record in column "${columnName}" by ID "${idOrName}" in collection "${collectionName}" - result is ${results}`
    )
  }

  const id = results[0].id

  return id
}

export const extendQueryFromUserInput = (
  baseQuery: PostgrestFilterBuilder<FullAsset>,
  operations: Operation[]
): PostgrestFilterBuilder<FullAsset> => {
  let query = baseQuery

  console.debug(`Query`, { operations })

  const methods: any[][] = []

  for (const operation of operations) {
    switch (operation.operator) {
      case Operator.HAS:
        methods.push(['contains', operation.fieldName, `{${operation.value}}`])
        query = query.contains(operation.fieldName, `{${operation.value}}`)
        break
      case Operator.OR:
        if (!Array.isArray(operation.value)) {
          throw new Error('Should be an array')
        }
        const filters = operation.value
          .map(value => `tags.cs.{${value}}`)
          .join(',')
        methods.push(['or', [filters]])
        query = query.or(filters)
        break
      case Operator.MINUS:
        methods.push(['not', 'tags', 'cs', `{${operation.value}}`])
        query = query.not('tags', 'cs', `{${operation.value}}`)
        break
      case Operator.WILDCARD:
        if (Array.isArray(operation.value)) {
          throw new Error('Should not be an array')
        }
        methods.push(['ilike', operation.fieldName, operation.value])
        query = query.ilike(operation.fieldName, operation.value)
        break
      case Operator.FILTER:
        methods.push(['eq', operation.fieldName, operation.value])
        query = query.eq(operation.fieldName, operation.value)
        break
      case Operator.SORT:
        const opts = {
          ascending: operation.value === 'asc'
        }
        methods.push(['order', operation.fieldName, opts])
        query = query.order(operation.fieldName, opts)
        break
      default:
        throw new Error(`Unknown operator "${operation.operator}"`)
    }
  }

  console.debug(`Query`, { methods })

  console.debug(`Query.return`, { query })

  return query
}

const getDisplayErrorMessage = (err: Error): string => {
  if (err instanceof InvalidUserInputError) {
    return 'Your input is invalid'
  }
  if (err instanceof CouldNotFindIdError) {
    return 'Could not find the data you want to filter with'
  }
  return err.message
}

const KEY_CODE_ENTER = 13
const KEY_CODE_ESCAPE = 27

const Renderer = ({ items }: { items?: PublicAsset[] }) => (
  <AssetResults assets={items} />
)

interface Suggestion {
  tag: string
  count: number
}

const getPartialTagFromUserInput = (userInput: string): string => {
  if (!userInput) {
    return ''
  }

  const chunks = getChunksFromUserInput(userInput)

  console.debug(`Query.getPartialTag`, { chunks })

  const lastChunk = chunks.pop()

  if (!lastChunk || lastChunk.includes(':')) {
    return ''
  }

  return lastChunk
}

export default () => {
  const classes = useStyles()
  const { query: rawQueryString = '' } = useParams<{ query: string }>()
  const isAdultContentEnabled = useIsAdultContentEnabled()
  const [lastError, setLastError] = useState<Error | null>(null)
  const rawQueryStringParsed = parseSearchTermFromUrlPath(rawQueryString)
  const [isFocused, setIsFocused] = useState(false)

  const [queryStringToDisplay, setQueryStringToDisplay] = useState(
    rawQueryStringParsed.trim()
  )
  const [queryStringToUse, setQueryStringToUse] = useState(
    rawQueryStringParsed.trim()
  )
  const [operations, setOperations] = useState<Operation[]>([])

  const userInputToUse = parseSearchTermFromUrlPath(queryStringToUse)

  const updateQueryStringToDisplay = (newQueryString: string): void => {
    updateQueryStringInUrl(newQueryString)
    setQueryStringToDisplay(newQueryString)
  }

  const autocompleteTimer = useRef<NodeJS.Timeout>()
  const userInput = parseSearchTermFromUrlPath(queryStringToDisplay)
  const partialTag = getPartialTagFromUserInput(userInput)

  const getSuggestionsQuery = useCallback(
    () =>
      supabase
        .from(CollectionNames.TagStats)
        .select('*')
        .ilike('tag', `${partialTag}*`)
        .limit(10),
    [partialTag]
  )
  const [isAutocompleting, setIsAutocompleting] = useState(false)
  const [, , suggestions] = useDataStore<Suggestion[]>(
    isAutocompleting && partialTag.length >= 3 ? getSuggestionsQuery : null
  )

  const completeSuggestion = (tag: string) => {
    console.debug(`Query.completeSuggestion`, tag)
    const chunks = getChunksFromUserInput(userInput).slice(0, -1)
    chunks.push(tag)
    const newUserInput = chunks.join(' ')
    updateQueryStringInUrl(newUserInput)
    setQueryStringToDisplay(newUserInput)
    setQueryStringToUse(newUserInput)
    setIsAutocompleting(false)
  }

  useEffect(() => {
    if (!isFocused) {
      // @ts-ignore
      clearTimeout(autocompleteTimer.current)
      setIsAutocompleting(false)
    }
  }, [isFocused])

  useEffect(() => {
    if (!userInput || userInput.length < 3) {
      return
    }

    if (!partialTag) {
      return
    }

    autocompleteTimer.current = setTimeout(() => {
      setIsAutocompleting(true)
    }, 500)

    return () => {
      // @ts-ignore
      clearTimeout(autocompleteTimer.current)
    }
  }, [userInput])

  useEffect(() => {
    ;(async () => {
      try {
        const newOperations = getOperationsFromUserInput(userInputToUse)

        console.debug(`Query.useEffect`, { newOperations })

        const finalOperations: Operation[] = []

        for (const operation of newOperations) {
          const newValue = Array.isArray(operation.value)
            ? await Promise.all(
                operation.value.map(value =>
                  getIdIfNotId(value, operation.fieldName)
                )
              )
            : await getIdIfNotId(operation.value, operation.fieldName)

          finalOperations.push({
            ...operation,
            value: newValue
          })
        }

        console.debug(`Query.useEffect.end`, { finalOperations })

        setOperations(finalOperations)
        setLastError(null)
      } catch (err) {
        setLastError(err as Error)
        console.error(err)
        handleError(err)
      }
    })()
  }, [userInputToUse])

  const getQuery = useCallback(
    query => {
      query = extendQueryFromUserInput(query, operations)

      if (isAdultContentEnabled !== true) {
        query = query.eq(AssetFieldNames.isAdult, false)
      }

      return query
    },
    [JSON.stringify(operations), isAdultContentEnabled]
  )

  const clearQuery = () => {
    updateQueryStringInUrl('')
    setQueryStringToDisplay('')
    setQueryStringToUse('')
  }

  return (
    <>
      <Helmet>
        <title>Execute a query | VRCArena</title>
        <meta
          name="description"
          content={`Use our booru-style query language to find the assets you want. Include or exclude tags, filter by author name and sort by different dates.`}
        />
      </Helmet>
      <div className={classes.root}>
        <WarningMessage>
          Welcome to the new query page. I replaced the old query language with
          a "booru"-style one. Please let me know in our Discord if it doesn't
          work for you.
        </WarningMessage>
        <BigSearchInput
          autoFocus
          onClear={clearQuery}
          // input props
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.keyCode === KEY_CODE_ENTER) {
              setQueryStringToUse(queryStringToDisplay)
            } else if (e.keyCode === KEY_CODE_ESCAPE) {
              clearQuery()
            }
          }}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            updateQueryStringToDisplay(e.target.value)
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          value={queryStringToDisplay}
          isSearching={false}
        />
        {isAutocompleting && suggestions && suggestions.length ? (
          <div className={classes.autocompleteList}>
            {suggestions.map(suggestion => (
              <div
                key={suggestion.tag}
                className={classes.autocompleteSuggestion}
                onMouseDown={() => completeSuggestion(suggestion.tag)}>
                {suggestion.tag} ({suggestion.count})
              </div>
            ))}
          </div>
        ) : null}
        <Link to={routes.queryCheatsheet}>View cheatsheet</Link>
        {lastError ? (
          <ErrorMessage>
            Failed to run query: {getDisplayErrorMessage(lastError)}
          </ErrorMessage>
        ) : null}
        {operations.length ? (
          <PaginatedView
            collectionName={'getpublicassets'}
            // @ts-ignore
            getQuery={getQuery}
            defaultFieldName={AssetFieldNames.createdAt}
            urlWithPageNumberVar={routes.queryWithVarAndPageVar.replace(
              ':query',
              convertSearchTermToUrlPath(queryStringToDisplay)
            )}>
            <Renderer />
          </PaginatedView>
        ) : (
          <Message>
            Type a query in the input above to get started
            <br />
            <br />
            We have a version of the "booru" style query system. View the
            cheatsheet <Link to={routes.queryCheatsheet}>here</Link>
          </Message>
        )}
      </div>
    </>
  )
}
