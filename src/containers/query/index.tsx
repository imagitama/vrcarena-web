import React, { SyntheticEvent, useCallback, useState } from 'react'
import { useParams } from 'react-router'
import Chip from '@material-ui/core/Chip'
import { makeStyles } from '@material-ui/core/styles'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import AddIcon from '@material-ui/icons/Add'
import CheckIcon from '@material-ui/icons/Check'

import BigSearchInput from '../../components/big-search-input'
import * as routes from '../../routes'
import {
  convertSearchTermToUrlPath,
  parseSearchTermFromUrlPath
} from '../../utils'
import useIsAdultContentEnabled from '../../hooks/useIsAdultContentEnabled'
import {
  AssetFieldNames,
  GetPublicAssetsFieldNames
} from '../../hooks/useDatabaseQuery'
import AssetResults from '../../components/asset-results'
import { TextField } from '@material-ui/core'
import categoryMeta from '../../category-meta'
import PaginatedView from '../../components/paginated-view'
import TagTextField from '../../components/tag-text-field'
import { SupabaseQueryBuilder } from '@supabase/supabase-js/dist/main/lib/SupabaseQueryBuilder'

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
  window.history.replaceState(
    null,
    'Search',
    newQueryString
      ? routes.queryWithVar.replace(
          ':query',
          convertSearchTermToUrlPath(newQueryString)
        )
      : routes.query
  )
}

const postgrestOperatorAbbreviations = {
  equals: 'eq',
  contains: 'cs',
  ilike: 'ilike'
}

const postgresLogicalOperators = {
  default: 'default', // doesnt actually exist
  not: 'not'
}

const isFieldAnArray = (fieldName: string): boolean => {
  switch (fieldName) {
    case AssetFieldNames.tags:
    case AssetFieldNames.species:
      return true
    default:
      return false
  }
}

interface Operation {
  fieldName: string
  logical: string | null
  operator: string
  value: string
}

const parseQueryStringToOperations = (queryString: string): Operation[] => {
  if (typeof queryString !== 'string' || !queryString || !queryString.length) {
    return []
  }

  const chunks = queryString.trim().split(' ')

  const operations = chunks.map(mapStringToOperation).filter(isOperationValid)

  return operations
}

const getOperatorForQuery = (
  logicalOperator: string | null,
  operator: string
): string => {
  if (
    !logicalOperator ||
    logicalOperator === postgresLogicalOperators.default
  ) {
    return operator
  }
  return `${logicalOperator}.${operator}`
}

type GetQueryFunction = (
  query: SupabaseQueryBuilder<any>
) => SupabaseQueryBuilder<any>

const useGetQuery = (
  operationsStr: string,
  operations: Operation[]
): GetQueryFunction => {
  const isAdultContentEnabled = useIsAdultContentEnabled()
  const getQuery = useCallback(
    query => {
      query =
        isAdultContentEnabled === false
          ? query.is(AssetFieldNames.isAdult, false)
          : query

      for (const operation of operations) {
        query = query.filter(
          getInternalFieldName(operation.fieldName),
          getOperatorForQuery(operation.logical, operation.operator),
          isFieldAnArray(operation.fieldName)
            ? `{${operation.value}}`
            : operation.value
        )
      }

      return query
    },
    [isAdultContentEnabled, operationsStr]
  )

  return getQuery
}

const getLogicalOperatorLabel = (logicalOperator: string): string =>
  logicalOperatorLabels[logicalOperator]

const getOperatorOutputSymbol = (operator: string): string => {
  switch (operator) {
    case postgrestOperatorAbbreviations.equals:
    case postgrestOperatorAbbreviations.ilike:
      return '='
    case postgrestOperatorAbbreviations.contains:
      return '⊃'
    default:
      return operator || ''
  }
}

const getOperatorLabel = (operator: string): string => {
  switch (operator) {
    case postgrestOperatorAbbreviations.equals:
    case postgrestOperatorAbbreviations.ilike:
      return 'Equals'
    case postgrestOperatorAbbreviations.contains:
      return 'Contains'
    default:
      return operator || ''
  }
}

const getFieldNameLabel = (fieldName: string): string => {
  switch (fieldName) {
    case GetPublicAssetsFieldNames.authorName:
      return 'author'
    default:
      return fieldName
  }
}

const getTextForOperation = (operation: Operation): string =>
  `${operation.fieldName}.${operation.operator}.${operation.value}`

const LabelForOperation = ({ operation }: { operation: Operation }) => (
  <>
    {getFieldNameLabel(operation.fieldName)}
    {operation.logical ? ` ${logicalOperatorSymbols[operation.logical]}` : ' '}
    <span title={getOperatorLabel(operation.operator)}>
      {getOperatorOutputSymbol(operation.operator)}
    </span>{' '}
    {operation.value}
  </>
)

const fieldNameLabels = {
  [AssetFieldNames.tags]: 'Tags',
  [AssetFieldNames.category]: 'Category',
  [AssetFieldNames.author]: 'Author'
}

const operatorLabels = {
  [postgrestOperatorAbbreviations.equals]: 'Equals',
  [postgrestOperatorAbbreviations.contains]: 'Contains'
}

const allowedOperators = {
  [AssetFieldNames.category]: [postgrestOperatorAbbreviations.equals],
  [AssetFieldNames.author]: [postgrestOperatorAbbreviations.equals]
}

const logicalOperatorLabels = {
  [postgresLogicalOperators.default]: 'Does',
  [postgresLogicalOperators.not]: 'Does Not'
}

const allowedLogicalOperators = {
  [AssetFieldNames.category]: [postgresLogicalOperators.default],
  [AssetFieldNames.author]: [postgresLogicalOperators.default]
}

const logicalOperatorSymbols = {
  [postgresLogicalOperators.default]: '',
  [postgresLogicalOperators.not]: '✖'
}

const CategorySelector = ({
  value,
  onNewValue
}: {
  value: string
  onNewValue: (newValue: string) => void
}) => (
  <Select value={value} onChange={e => onNewValue(e.target.value as string)}>
    {Object.entries(categoryMeta).map(([category, meta]) => (
      <MenuItem key={category} value={category}>
        {meta.nameSingular}
      </MenuItem>
    ))}
  </Select>
)

const TextInput = ({
  value,
  onNewValue,
  onDone
}: {
  value: string
  onNewValue: (newValue: string) => void
  onDone: (newTag?: string) => void
}) => (
  <TextField
    value={value}
    onKeyDown={e => {
      if (e.key === 'Enter') {
        onDone()
      }
    }}
    onChange={e => onNewValue(e.target.value)}
  />
)

const ValueInput = ({
  fieldName,
  value,
  onNewValue,
  onDone
}: {
  fieldName: string
  value: string
  onNewValue: (newValue: string) => void
  onDone: (newTag?: string) => void
}) => {
  const classes = useStyles()
  switch (fieldName) {
    case AssetFieldNames.category:
      return <CategorySelector value={value} onNewValue={onNewValue} />
    case AssetFieldNames.tags:
      return (
        <TagTextField
          onChange={(newTags: string[]) => {
            if (newTags.length) {
              onDone(newTags[0])
            } else {
              onNewValue('')
            }
          }}
          className={classes.tagTextField}
        />
      )
    default:
      return <TextInput value={value} onNewValue={onNewValue} onDone={onDone} />
  }
}

const getDefaultOperatorForFieldName = (fieldName: string): string => {
  switch (fieldName) {
    case AssetFieldNames.tags:
      return postgrestOperatorAbbreviations.contains
    default:
      return postgrestOperatorAbbreviations.equals
  }
}

const AddOperationForm = ({
  onAdd
}: {
  onAdd: (
    fieldName: string,
    logical: string | null,
    operator: string,
    value: string
  ) => void
}) => {
  const [fieldName, setFieldName] = useState('')
  const [logical, setLogical] = useState(postgresLogicalOperators.default)
  const [operator, setOperator] = useState(
    postgrestOperatorAbbreviations.contains
  )
  const [value, setValue] = useState('')

  const changeFieldName = (newFieldName: string): void => {
    setFieldName(newFieldName)
    setOperator(getDefaultOperatorForFieldName(newFieldName))
  }

  const onDone = (overrideNewValue?: string): void => {
    if (!fieldName || !operator || (!value && !overrideNewValue)) {
      return
    }
    const actualNewValue = overrideNewValue || value
    onAdd(
      fieldName,
      logical === postgresLogicalOperators.default ? null : logical,
      operator,
      actualNewValue
    )
  }

  return (
    <>
      <Select
        value={fieldName}
        label={fieldName || 'Field'}
        onChange={e => changeFieldName(e.target.value as string)}>
        {Object.entries(fieldNameLabels).map(([name, label]) => (
          <MenuItem key={name} value={name}>
            {label}
          </MenuItem>
        ))}
      </Select>
      <Select
        value={logical}
        label={getLogicalOperatorLabel(logical)}
        onChange={e => setLogical(e.target.value as string)}>
        {Object.entries(logicalOperatorLabels)
          .filter(([name]) =>
            fieldName && allowedLogicalOperators[fieldName]
              ? allowedLogicalOperators[fieldName].includes(name)
              : true
          )
          .map(([name, label]) => (
            <MenuItem key={name} value={name}>
              {label}
            </MenuItem>
          ))}
      </Select>
      <Select
        value={operator}
        label={operator ? getOperatorLabel(operator) : 'Operator'}
        onChange={e => setOperator(e.target.value as string)}>
        {Object.entries(operatorLabels)
          .filter(([name]) =>
            fieldName && allowedOperators[fieldName]
              ? allowedOperators[fieldName].includes(name)
              : true
          )
          .map(([name, label]) => (
            <MenuItem key={name} value={name}>
              {label}
            </MenuItem>
          ))}
      </Select>
      <ValueInput
        fieldName={fieldName}
        value={value}
        onNewValue={newValue => setValue(newValue)}
        onDone={onDone}
      />
      <CheckIcon onClick={() => onDone()} />
    </>
  )
}

const OperationsOutput = ({
  queryStringToDisplay,
  onAddOperationWithFields,
  onRemoveOperation
}: {
  queryStringToDisplay: string
  onAddOperationWithFields: (
    fieldName: string,
    logical: string | null,
    operator: string,
    value: string
  ) => void
  onRemoveOperation: (operation: Operation) => void
}) => {
  const classes = useStyles()
  const [isAddFormVisible, setIsAddFormVisible] = useState(false)

  const queryStringToParse = parseSearchTermFromUrlPath(queryStringToDisplay)

  const operations = parseQueryStringToOperations(queryStringToParse)

  return (
    <div className={classes.operations}>
      {operations.map(operation => (
        <div key={getTextForOperation(operation)} className={classes.operation}>
          <Chip
            label={<LabelForOperation operation={operation} />}
            onDelete={() => onRemoveOperation(operation)}
          />
        </div>
      ))}
      {isAddFormVisible ? (
        <AddOperationForm
          onAdd={(...args) => {
            setIsAddFormVisible(false)
            onAddOperationWithFields(...args)
          }}
        />
      ) : (
        <Chip
          label="Add"
          onClick={() => setIsAddFormVisible(true)}
          icon={<AddIcon />}
        />
      )}
    </div>
  )
}

const getInternalFieldName = (userFieldName: string): string => {
  switch (userFieldName) {
    case 'author':
      return GetPublicAssetsFieldNames.authorName
    default:
      return userFieldName
  }
}

const mapStringToOperation = (chunk: string): Operation | false => {
  if (chunk.includes(':')) {
    const itemsInsideChunk = chunk.split(':')
    const fieldName = itemsInsideChunk[0]
    const value = itemsInsideChunk[1]

    return {
      fieldName,
      logical: null,
      operator: postgrestOperatorAbbreviations.ilike,
      value
    }
  }

  if (chunk.includes('.')) {
    const itemsInsideChunk = chunk.split('.')

    const includesLogical = itemsInsideChunk.length === 4

    const fieldName = itemsInsideChunk[0]
    const logical = includesLogical ? itemsInsideChunk[1] : null
    const operator = includesLogical ? itemsInsideChunk[2] : itemsInsideChunk[1]
    const value = includesLogical ? itemsInsideChunk[3] : itemsInsideChunk[2]

    return {
      fieldName,
      logical,
      operator,
      value
    }
  }

  if (chunk.includes('-')) {
    const tagName = chunk.substring(1)

    if (!tagName) {
      return false
    }

    return {
      fieldName: AssetFieldNames.tags,
      logical: postgresLogicalOperators.not,
      operator: postgrestOperatorAbbreviations.contains,
      value: tagName
    }
  }

  const tagName = chunk

  if (!tagName) {
    return false
  }

  return {
    fieldName: AssetFieldNames.tags,
    logical: null,
    operator: postgrestOperatorAbbreviations.contains,
    value: tagName
  }
}

const mapOperationToString = ({
  fieldName,
  logical,
  operator,
  value
}: Operation): string => {
  switch (fieldName) {
    case AssetFieldNames.tags:
      return `${logical === postgresLogicalOperators.not ? '-' : ''}${value}`
    default:
      switch (operator) {
        case postgrestOperatorAbbreviations.equals:
          return `${fieldName}:${value}`
        default:
          return `${fieldName}${
            logical ? `.${logical}` : ''
          }.${operator}.${value}`
      }
  }
}

const areOperationsTheSame = (
  operationA: Operation,
  operationB: Operation
): boolean => {
  for (const prop in operationA) {
    // @ts-ignore
    if (operationA[prop] !== operationB[prop]) {
      return false
    }
  }

  return true
}

const KEY_CODE_ENTER = 13
const KEY_CODE_ESCAPE = 27

interface PaginatedViewItem {}

const Renderer = ({ items }: { items?: PaginatedViewItem[] }) => (
  // @ts-ignore
  <AssetResults assets={items} />
)

const isOperationValid = (value: unknown): value is Operation => value !== false

export default () => {
  const classes = useStyles()
  const { query: rawQueryString = '' } = useParams<{ query: string }>()

  const rawQueryStringParsed = parseSearchTermFromUrlPath(rawQueryString)

  const [queryStringToDisplay, setQueryStringToDisplay] = useState(
    rawQueryStringParsed.trim()
  )
  const [queryStringToUse, setQueryStringToUse] = useState(
    rawQueryStringParsed.trim()
  )

  const queryStringToParse = parseSearchTermFromUrlPath(queryStringToUse)

  const updateQueryStringToDisplay = (newQueryString: string): void => {
    updateQueryStringInUrl(newQueryString)
    setQueryStringToDisplay(newQueryString)
  }

  const operations = parseQueryStringToOperations(queryStringToParse)

  const getQuery = useGetQuery(queryStringToParse, operations)

  const clearQuery = () => {
    updateQueryStringInUrl('')
    setQueryStringToDisplay('')
    setQueryStringToUse('')
  }

  const onAddOperationWithFields = (
    fieldName: string,
    logical: string | null,
    operator: string,
    value: string
  ) => {
    let newQueryString = queryStringToDisplay ? `${queryStringToDisplay} ` : ''

    newQueryString = `${newQueryString} ${mapOperationToString({
      fieldName,
      logical,
      operator,
      value
    })}`

    updateQueryStringToDisplay(newQueryString)
    setQueryStringToUse(newQueryString)
  }

  const onRemoveOperation = (operationToRemove: Operation): void => {
    const newQueryString = queryStringToDisplay
      .trim()
      .split(' ')
      .map(mapStringToOperation)
      .filter(isOperationValid)
      .filter(operation => !areOperationsTheSame(operationToRemove, operation))
      .map(mapOperationToString)
      .join(' ')
    updateQueryStringToDisplay(newQueryString)
    setQueryStringToUse(newQueryString)
  }

  return (
    <div className={classes.root}>
      <OperationsOutput
        queryStringToDisplay={queryStringToDisplay}
        onAddOperationWithFields={onAddOperationWithFields}
        onRemoveOperation={onRemoveOperation}
      />
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
      <PaginatedView
        collectionName={'getpublicassets'}
        // select="*, author!inner(name)"
        // @ts-ignore
        getQuery={getQuery}
        defaultFieldName={AssetFieldNames.createdAt}>
        <Renderer />
      </PaginatedView>
    </div>
  )
}
