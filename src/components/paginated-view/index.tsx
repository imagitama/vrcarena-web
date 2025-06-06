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
import useDatabaseQuery, {
  OrderDirections,
  WhereClause,
} from '../../hooks/useDatabaseQuery'
import { DataStoreErrorCode, GetQuery } from '../../data-store'
import useScrollMemory from '../../hooks/useScrollMemory'
import { getPathForQueryString } from '../../queries'
import { scrollToTop } from '../../utils'
import WarningMessage from '../warning-message'
import { mediaQueryForMobiles } from '../../media-queries'
import { SupabaseClient } from '@supabase/supabase-js'
import {
  AccessStatus,
  ApprovalStatus,
  PublishStatus,
} from '../../modules/common'

const useStyles = makeStyles({
  root: {
    marginTop: '0.5rem',
  },
  controls: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  controlsLeft: {
    display: 'flex',
    '& > *:first-child': {
      marginLeft: 'auto',
    },
    [mediaQueryForMobiles]: {
      width: '100%',
      flexShrink: 1,
    },
  },
  controlsRight: {
    width: '100%',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'end',
    '& > *:first-child': {
      marginLeft: 'auto',
    },
  },
  controlGroup: {
    display: 'flex',
    marginLeft: '0.5rem',
    flexWrap: 'wrap',
    [mediaQueryForMobiles]: {
      margin: '0.1rem',
    },
  },
  control: {
    marginLeft: '0.5rem',
  },
})

const limitPerPage = 50

type Filters = { [fieldName: string]: string | null }

type GetQueryFn<TRecord> = (
  currentQuery: GetQuery<TRecord>,
  selectedSubView: string | null
) => GetQuery<TRecord> | Promise<GetQuery<TRecord>>

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
  whereClauses?: WhereClause<TRecord>[]
}

// @ts-ignore
export const PaginatedViewContext = createContext<PaginatedViewData>()
export const usePaginatedView = (): PaginatedViewData<any> =>
  useContext(PaginatedViewContext)

export interface RendererProps<T> {
  items: T[]
  hydrate: () => void
}

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
    whereClauses,
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

  const rangeStart = (currentPageNumber - 1) * limitPerPage
  const rangeEnd = rangeStart + limitPerPage - 1

  const pageGetQuery = useCallback(
    async (supabase: SupabaseClient) => {
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

      if (whereClauses) {
        return
      }

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
    },
    [
      viewName,
      getQuery,
      currentPageNumber,
      sorting ? `${sorting.fieldName}.${sorting.direction}` : null,
      selectedSubView,
      Object.values(filters).join('+'),
      isEditor,
    ]
  )
  const [
    isLoadingDataStore,
    lastErrorCodeDataStore,
    itemsDataStore,
    totalCountDataStore,
    hydrateDataStore,
  ] = useDataStore<any>(whereClauses ? null : pageGetQuery, {
    queryName: `paginated-view-${collectionName || viewName}`,
    uncatchErrorCodes: [DataStoreErrorCode.BadRange],
  })

  const [
    isLoadingQuery,
    lastErrorCodeQuery,
    itemsQuery,
    hydrateQuery,
    totalCountQuery,
  ] = useDatabaseQuery(
    collectionName || viewName || '',
    whereClauses || false,
    {
      offset: rangeStart,
      limit: limitPerPage,
      orderBy: sorting ? [sorting.fieldName, sorting.direction] : undefined,
    }
  )

  const isLoading = whereClauses ? isLoadingQuery : isLoadingDataStore
  const lastErrorCode = whereClauses
    ? lastErrorCodeQuery
    : lastErrorCodeDataStore
  const items = whereClauses ? itemsQuery : itemsDataStore
  const totalCount = whereClauses ? totalCountQuery : totalCountDataStore
  const hydrate = whereClauses ? hydrateQuery : hydrateDataStore

  useScrollMemory(isLoading === false && lastErrorCode === null)

  if (lastErrorCode !== null) {
    if (lastErrorCode === DataStoreErrorCode.BadRange) {
      return (
        <NoResultsMessage>
          No results found for page {currentPageNumber}
        </NoResultsMessage>
      )
    }
    return (
      <ErrorMessage>
        Failed to load page: error code {lastErrorCode}
      </ErrorMessage>
    )
  }

  if (isLoading || !items) {
    return <LoadingIndicator message={`Loading page ${currentPageNumber}...`} />
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
      // @ts-ignore
      selectedId={filters[fieldName] ? filters[fieldName] : clearId}
      options={Object.entries(fieldMap)
        .map(([key, val]) => ({ id: val, label: key }))
        .concat([{ id: clearId, label: 'Default' }])}
      onSelect={onSelect}
      size="small"
      color="default"
      label={label}
    />
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
  extraControlsLeft?: React.ReactElement[] // todo: better name
  urlWithPageNumberVar?: string
  createUrl?: string
  subViews?: SubViewConfig[]
  showCommonMetaControls?: boolean
  getQueryString?: () => string
  limit?: number
  whereClauses?: WhereClause<TRecord>[]
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
  extraControlsLeft = [],
  urlWithPageNumberVar = '',
  createUrl,
  subViews,
  showCommonMetaControls = false,
  getQueryString = undefined,
  limit = undefined,
  whereClauses,
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
        whereClauses,
      }}>
      <div className={classes.root}>
        <div className={classes.controls}>
          {extraControlsLeft ? (
            <div className={classes.controlsLeft}>
              <ControlGroup>{extraControlsLeft}</ControlGroup>
            </div>
          ) : null}
          <div className={classes.controlsRight}>
            {isEditor && showCommonMetaControls ? (
              <ControlGroup>
                <CommonMetaControl
                  label="Access"
                  fieldName={'accessstatus'}
                  fieldMap={AccessStatus}
                />
                &nbsp;
                <CommonMetaControl
                  label="Approval"
                  fieldName={'approvalstatus'}
                  fieldMap={ApprovalStatus}
                />
                &nbsp;
                <CommonMetaControl
                  label="Publish"
                  fieldName={'publishstatus'}
                  fieldMap={PublishStatus}
                />
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
                      size="small"
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
                  <Control key={idx}>
                    {React.cloneElement(extraControl, {
                      color: 'default',
                      size: 'small',
                    })}
                  </Control>
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
                  <Button icon={<AddIcon />} size="small" url={createUrl}>
                    Create
                  </Button>
                </Control>
              </ControlGroup>
            ) : null}
          </div>
        </div>
        <Page />
      </div>
    </PaginatedViewContext.Provider>
  )
}

export default PaginatedView
