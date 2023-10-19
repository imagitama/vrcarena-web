import React, { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { makeStyles } from '@material-ui/core/styles'
import { PostgrestFilterBuilder } from '@supabase/postgrest-js'

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
import { FullAsset, PublicAsset } from '../../modules/assets'
import { query } from '../../data-store'
import { CollectionNames as AuthorCollectionNames } from '../../modules/authors'
import { CollectionNames as UserCollectionNames } from '../../modules/users'
import { CollectionNames as SpeciesCollectionNames } from '../../modules/species'
import Link from '../../components/link'
import { handleError } from '../../error-handling'
import ErrorMessage from '../../components/error-message'
import Message from '../../components/message'

const useStyles = makeStyles({
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
  }
})

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
  // const chunks = userInput.split(' ')

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
    // throw new Error(
    //   `Cannot get collection name for field name "${fieldName}"`
    // )
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
        // const valueToUse = operation.value.replaceAll('*', '%')
        const valueToUse = operation.value
        methods.push(['ilike', operation.fieldName, valueToUse])
        query = query.ilike(operation.fieldName, valueToUse)
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

// const parseQueryStringToOperations = (queryString: string): Operation[] =>
//   getOperationsFromUserInput(window.decodeURIComponent(queryString))

const KEY_CODE_ENTER = 13
const KEY_CODE_ESCAPE = 27

const Renderer = ({ items }: { items?: PublicAsset[] }) => (
  <AssetResults assets={items} />
)

// const isOperationValid = (value: unknown): value is Operation => value !== false

export default () => {
  const classes = useStyles()
  const { query: rawQueryString = '' } = useParams<{ query: string }>()
  const isAdultContentEnabled = useIsAdultContentEnabled()
  const [lastError, setLastError] = useState<Error | null>(null)

  const rawQueryStringParsed = parseSearchTermFromUrlPath(rawQueryString)

  console.debug(`Parse Query String`, { rawQueryString, rawQueryStringParsed })

  const [queryStringToDisplay, setQueryStringToDisplay] = useState(
    rawQueryStringParsed.trim()
  )
  const [queryStringToUse, setQueryStringToUse] = useState(
    rawQueryStringParsed.trim()
  )
  const [operations, setOperations] = useState<Operation[]>([])

  const queryStringToParse = parseSearchTermFromUrlPath(queryStringToUse)

  const updateQueryStringToDisplay = (newQueryString: string): void => {
    updateQueryStringInUrl(newQueryString)
    setQueryStringToDisplay(newQueryString)
  }

  const userInput = queryStringToParse

  useEffect(() => {
    ;(async () => {
      try {
        const newOperations = getOperationsFromUserInput(userInput)

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
  }, [userInput])

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
    <div className={classes.root}>
      <BigSearchInput
        onClear={clearQuery}
        // input props
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.keyCode === KEY_CODE_ENTER) {
            setQueryStringToUse(queryStringToDisplay)
          } else if (e.keyCode === KEY_CODE_ESCAPE) {
            clearQuery()
          }
        }}
        onChange={(e: React.ChangeEvent) =>
          // @ts-ignore TODO Investigate
          updateQueryStringToDisplay(e.target.value)
        }
        value={queryStringToDisplay}
        isSearching={false}
      />
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
          defaultFieldName={AssetFieldNames.createdAt}>
          <Renderer />
        </PaginatedView>
      ) : (
        <Message>Enter a query to get started</Message>
      )}
    </div>
  )
}
