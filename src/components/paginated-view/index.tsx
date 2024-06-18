import React, {
  Fragment,
  useContext,
  createContext,
  useCallback,
  useState,
} from 'react'
import { useParams } from 'react-router'
import { makeStyles } from '@material-ui/core/styles'
import AddIcon from '@material-ui/icons/Add'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import { PostgrestFilterBuilder } from '@supabase/postgrest-js'

import SortControls, { SortOption } from '../sort-controls'
import PagesNavigation from '../pages-navigation'
import ErrorMessage from '../error-message'
import NoResultsMessage from '../no-results-message'
import LoadingIndicator from '../loading-indicator'
import Button from '../button'
import ButtonDropdown from '../button-dropdown'

import useHistory from '../../hooks/useHistory'
import useSorting from '../../hooks/useSorting'
import useDataStore from '../../hooks/useDataStore'
import useIsEditor from '../../hooks/useIsEditor'
import { client as supabase } from '../../supabase'
import {
  OrderDirections,
  AccessStatuses,
  PublishStatuses,
  ApprovalStatuses,
} from '../../hooks/useDatabaseQuery'
import { CommonMetaFieldNames, DataStoreErrorCode } from '../../data-store'
import useScrollMemory from '../../hooks/useScrollMemory'
import { getPathForQueryString } from '../../queries'
import { scrollToTop } from '../../utils'
import WarningMessage from '../warning-message'

const useStyles = makeStyles({
  root: {
    marginTop: '0.5rem',
  },
  controls: {
    display: 'flex',
    '& > *:first-child': {
      marginLeft: 'auto',
    },
  },
  controlGroup: {
    display: 'flex',
    marginLeft: '1rem',
  },
  control: {
    marginLeft: '0.5rem',
  },
})

const limitPerPage = 50

type Filters = { [fieldName: string]: string | null }

type GetQueryFn<TRecord> = (
  currentQuery: PostgrestFilterBuilder<TRecord>,
  selectedSubView: string | null
) => PostgrestFilterBuilder<TRecord> | Promise<PostgrestFilterBuilder<TRecord>>

interface SubViewConfig {
  id: string | number | null
  label: string
}

interface PaginatedViewData<TRecord> {
  viewName?: string
  editorViewName?: string
  collectionName?: string
  select: string
  getQuery?: GetQueryFn<TRecord>
  sortKey: string
  defaultFieldName: keyof TRecord
  defaultDirection?: OrderDirections
  renderer: React.ReactElement
  urlWithPageNumberVar: string
  selectedSubView: string | null
  filters: Filters
  setFilters: (newFilters: Filters) => void
  internalPageNumber: number | null
  setInternalPageNumber: (newPageNumber: number) => void
  subViews?: SubViewConfig[]
  sortOptions?: SortOption<TRecord>[]
  getQueryString?: () => string
}

// @ts-ignore
const PaginatedViewContext = createContext<PaginatedViewData>()
export const usePaginatedView = (): PaginatedViewData<any> =>
  useContext(PaginatedViewContext)

const Page = () => {
  const { push } = useHistory()
  const { pageNumber = '1' } = useParams<{ pageNumber: string }>()
  const isEditor = useIsEditor()
  const {
    viewName,
    editorViewName,
    collectionName,
    select,
    getQuery,
    sortKey,
    sortOptions,
    defaultFieldName,
    defaultDirection,
    renderer,
    urlWithPageNumberVar,
    selectedSubView,
    filters,
    internalPageNumber,
    setInternalPageNumber,
    getQueryString,
  } = usePaginatedView()
  const currentPageNumber = internalPageNumber || parseInt(pageNumber)
  const [sorting] = useSorting(
    sortKey,
    defaultFieldName as string,
    defaultDirection
  )
  const isSortingValid =
    sorting?.fieldName === defaultFieldName || sortOptions === undefined
      ? true
      : sortOptions
      ? sortOptions.find(
          (sortOption) => sortOption.fieldName === sorting?.fieldName
        )
      : false
  const pageGetQuery = useCallback(async () => {
    const rangeStart = (currentPageNumber - 1) * limitPerPage
    const rangeEnd = rangeStart + limitPerPage - 1

    const isAscending =
      sorting && isSortingValid
        ? sorting.direction === OrderDirections.ASC
        : false

    let query: any

    // "exact" gives us correct count at a cost of performance
    // "estimated" is better for performance but is always capped at the max read number (1000)
    const selectOptions: {
      count: 'exact' | 'planned' | 'estimated' | null | undefined
    } = { count: 'exact' }

    if (!collectionName && !viewName) {
      throw new Error(
        'Cannot query for paginated results - need collection name or view name!'
      )
    }

    if (viewName) {
      query = supabase.from(
        (isEditor && editorViewName ? editorViewName : viewName).toLowerCase()
      )
      query = query.select('*', selectOptions)

      // supabase does not have support for "views" but the underlying REST API does so jam it in here
      // TODO: Investigate as apparently supported: https://github.com/supabase/supabase/issues/190#issuecomment-689591527
      // query.url = new URL(`${supabase.restUrl}/${viewName.toLowerCase()}`)
    } else if (collectionName) {
      query = supabase.from(collectionName)
      query = query.select(select, selectOptions)
    } else {
      throw new Error(
        'Cannot render PaginatedView: need view or collection name'
      )
    }

    if (getQuery) {
      query = getQuery(query, selectedSubView)
    }

    for (const [fieldName, fieldValue] of Object.entries(filters)) {
      if (fieldValue) {
        query = query.eq(fieldName, fieldValue)
      }
    }

    // toLowerCase incase they saved an old camelCase field name which breaks SQL
    query = query.range(rangeStart, rangeEnd)

    if (sorting && isSortingValid) {
      query = query.order(sorting.fieldName.toLowerCase(), {
        ascending: isAscending,
      })
    }

    // hack
    if (sorting && sorting.fieldName === 'pluralname') {
      query = query.order('title', {
        ascending: true,
      })
    }

    return query
  }, [
    viewName,
    getQuery,
    currentPageNumber,
    sorting ? `${sorting.fieldName}.${sorting.direction}` : null,
    selectedSubView,
    Object.values(filters).join('+'),
    isEditor,
  ])
  const [isLoading, lastErrorCode, items, totalCount, hydrate] = useDataStore<
    any[]
  >(pageGetQuery, {
    queryName: `paginated-view-${collectionName || viewName}`,
    uncatchErrorCodes: [DataStoreErrorCode.BadRange],
  })

  useScrollMemory(isLoading === false && lastErrorCode === null)

  if (lastErrorCode !== null) {
    if (lastErrorCode === DataStoreErrorCode.BadRange) {
      return (
        <NoResultsMessage>
          No results found for page {currentPageNumber}
        </NoResultsMessage>
      )
    }
    return <ErrorMessage>Failed to load page!</ErrorMessage>
  }

  if (isLoading || !items) {
    return <LoadingIndicator message="Loading page..." />
  }

  if (!items.length) {
    return <NoResultsMessage />
  }

  return (
    <>
      {!isSortingValid && sorting && (
        <WarningMessage>
          Your previous sorting selection ({sorting?.fieldName}) appears to be
          invalid and has been reset
        </WarningMessage>
      )}
      {React.cloneElement(renderer, {
        items,
        hydrate,
      })}
      {totalCount ? (
        <PagesNavigation
          currentPageNumber={currentPageNumber}
          pageCount={Math.ceil(totalCount / limitPerPage)}
          onClickWithPageNumber={(newPageNumber) => {
            if (urlWithPageNumberVar) {
              push(
                urlWithPageNumberVar.replace(
                  ':pageNumber',
                  newPageNumber.toString()
                )
              )
            } else {
              setInternalPageNumber(newPageNumber)
            }
            scrollToTop(true)
          }}
        />
      ) : null}
      {getQueryString ? (
        <Button url={getPathForQueryString(getQueryString())} color="default">
          Generate Query
        </Button>
      ) : null}
    </>
  )
}

const ControlGroup = ({ children }: { children: React.ReactNode }) => {
  const classes = useStyles()
  return <div className={classes.controlGroup}>{children}</div>
}

const Control = ({ children }: { children: React.ReactNode }) => {
  const classes = useStyles()
  return <div className={classes.control}>{children}</div>
}

const clearId = 'clear'

const CommonMetaControl = ({
  label,
  fieldName,
  fieldMap,
}: {
  label: string
  fieldName: string
  fieldMap: { [key: string]: string }
}) => {
  const { filters, setFilters } = usePaginatedView()

  const onSelect = (newVal: string) =>
    setFilters({
      [fieldName]: newVal === clearId ? null : newVal,
    })

  return (
    <ButtonDropdown
      selectedId={filters[fieldName] ? filters[fieldName] : clearId}
      options={Object.entries(fieldMap)
        .map(([key, val]) => ({ id: val, label: key }))
        .concat([{ id: clearId, label: 'Clear' }])}
      onSelect={onSelect}
      color="default">
      {label}
    </ButtonDropdown>
  )
}

const CommonMetaControls = () => {
  return (
    <>
      <CommonMetaControl
        label="Access"
        fieldName={CommonMetaFieldNames.accessStatus}
        fieldMap={AccessStatuses}
      />
      &nbsp;
      <CommonMetaControl
        label="Approval"
        fieldName={CommonMetaFieldNames.approvalStatus}
        fieldMap={ApprovalStatuses}
      />
      &nbsp;
      <CommonMetaControl
        label="Publish"
        fieldName={CommonMetaFieldNames.publishStatus}
        fieldMap={PublishStatuses}
      />
    </>
  )
}

const subViewConfigAll: SubViewConfig[] = [
  {
    label: 'All',
    id: null,
  },
]

export interface PaginatedViewProps<TRecord> {
  viewName?: string
  editorViewName?: string
  collectionName?: string
  select?: string
  getQuery?: GetQueryFn<TRecord>
  sortKey?: string
  sortOptions?: SortOption<TRecord>[]
  defaultFieldName?: keyof TRecord
  defaultDirection?: OrderDirections
  children?: React.ReactElement
  extraControls?: React.ReactElement[]
  urlWithPageNumberVar?: string
  createUrl?: string
  subViews?: SubViewConfig[]
  showCommonMetaControls?: boolean
  getQueryString?: () => string
  limit?: number
}

const PaginatedView = <TRecord,>({
  viewName,
  editorViewName,
  collectionName,
  select = '*',
  getQuery = undefined,
  sortKey = undefined,
  sortOptions = [],
  defaultFieldName = undefined,
  defaultDirection,
  children,
  extraControls = [],
  urlWithPageNumberVar = '',
  createUrl,
  subViews,
  showCommonMetaControls = false,
  getQueryString = undefined,
  limit = undefined,
}: PaginatedViewProps<TRecord>) => {
  if (!children) {
    throw new Error('Cannot render cached view without a renderer!')
  }

  const [selectedSubView, setSelectedSubView] = useState<
    string | number | null
  >(null)
  const [filters, setFilters] = useState({})
  const classes = useStyles()
  const isEditor = useIsEditor()
  const { pageNumber = '1' } = useParams<{ pageNumber: string }>()

  const currentPageNumber = parseInt(pageNumber)

  // for views that do not want to use the URL to track page number
  // eg users/abc/assets
  const [internalPageNumber, setInternalPageNumber] = useState<number | null>(
    urlWithPageNumberVar ? null : currentPageNumber
  )

  return (
    <PaginatedViewContext.Provider
      value={{
        viewName,
        editorViewName,
        collectionName,
        select,
        getQuery,
        sortKey,
        defaultFieldName,
        defaultDirection,
        renderer: children,
        sortOptions,
        urlWithPageNumberVar,
        subViews,
        selectedSubView,
        filters,
        setFilters,
        internalPageNumber,
        setInternalPageNumber,
        getQueryString,
      }}>
      <div className={classes.root}>
        <div className={classes.controls}>
          {isEditor && showCommonMetaControls ? (
            <ControlGroup>
              <CommonMetaControls />
            </ControlGroup>
          ) : null}
          {subViews ? (
            <ControlGroup>
              {subViewConfigAll.concat(subViews).map(({ label, id }, idx) => (
                <Fragment key={id}>
                  {idx !== 0 ? <>&nbsp;</> : ''}
                  <Button
                    onClick={() => setSelectedSubView(id)}
                    color="default"
                    icon={
                      selectedSubView === id ? (
                        <CheckBoxIcon />
                      ) : (
                        <CheckBoxOutlineBlankIcon />
                      )
                    }>
                    {label}
                  </Button>
                </Fragment>
              ))}
            </ControlGroup>
          ) : null}
          {extraControls ? (
            <ControlGroup>
              {extraControls.map((extraControl, idx) => (
                <Control key={idx}>{extraControl}</Control>
              ))}
            </ControlGroup>
          ) : null}
          {sortOptions.length ? (
            <ControlGroup>
              <Control>
                <SortControls
                  options={sortOptions}
                  // @ts-ignore
                  sortKey={sortKey}
                  // @ts-ignore
                  defaultFieldName={defaultFieldName}
                />
              </Control>
            </ControlGroup>
          ) : null}
          {createUrl ? (
            <ControlGroup>
              <Control>
                <Button icon={<AddIcon />} url={createUrl}>
                  Create
                </Button>
              </Control>
            </ControlGroup>
          ) : null}
        </div>
        <Page />
      </div>
    </PaginatedViewContext.Provider>
  )
}

export default PaginatedView
