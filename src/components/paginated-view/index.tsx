import React, {
  Fragment,
  useContext,
  createContext,
  useCallback,
  useState,
} from 'react'
import { useParams } from 'react-router'
import { makeStyles } from '@mui/styles'
import AddIcon from '@mui/icons-material/Add'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import {
  PostgrestQueryBuilder,
  PostgrestFilterBuilder,
} from '@supabase/postgrest-js'

import SortControls, { SortOption } from '../sort-controls'
import PagesNavigation from '../pages-navigation'
import ErrorMessage from '../error-message'
import NoResultsMessage from '../no-results-message'
import LoadingIndicator from '../loading-indicator'
import Button, { ButtonProps } from '../button'
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
import ErrorBoundary from '../error-boundary'
import {
  ActiveFilter,
  EqualActiveFilter,
  Filter,
  FilterSubType,
  FilterType,
  MultichoiceActiveFilter,
  NotEqualActiveFilter,
} from '../../filters'
import useFilters from '../../hooks/useFilters'
import Filters from '../filters'
import useStorage from '../../hooks/useStorage'
import { Refresh as RefreshIcon } from '../../icons'

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
    marginRight: 'auto',
    '& > *:first-child': {
      marginLeft: 'auto',
    },
    [mediaQueryForMobiles]: {
      width: '100%',
      flexShrink: 1,
    },
  },
  controlsRight: {
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
  rendererWrapper: {
    marginTop: '0.5rem',
  },
  hydrateIcon: {
    cursor: 'pointer',
    padding: '0.5rem',
    fontSize: '2rem !important',
    transition: '100ms all',
    '&:hover': {
      transform: 'scale(1.1)',
    },
  },
  // isHydrating: {
  //   animation: '$spinRefreshIcon 250ms linear infinite',
  // },
  // '@keyframes spinRefreshIcon': {
  //   '0%': {
  //     transform: 'rotate(0deg)',
  //   },
  //   '100%': {
  //     transform: 'rotate(360deg)',
  //   },
  // },
})

const limitPerPage = 50

export type GetQueryFn<TRecord, SubViewEnum = any, TFilters = Filter<any>[]> = (
  currentQuery: GetQuery<TRecord>,
  selectedSubView: SubViewEnum | null,
  activeFilters: ActiveFilter<any>[]
) => GetQuery<TRecord> | Promise<GetQuery<TRecord>>

interface SubViewConfig {
  id: string
  label: string
  defaultActive?: boolean
}

interface PaginatedViewData<TRecord> {
  name?: string
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
  filtersKey: string
  filters: Filter<TRecord>[]
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
  selectedSubView: string | null
  activeFilters: ActiveFilter<any>[]
}

const Page = () => {
  const classes = useStyles()
  const { push } = useHistory()
  const { pageNumber = '1' } = useParams<{ pageNumber: string }>()
  const isEditor = useIsEditor()
  const {
    name,
    viewName,
    editorViewName,
    collectionName,
    select,
    getQuery,
    sortOptions,
    defaultFieldName,
    defaultDirection,
    renderer,
    filters,
    urlWithPageNumberVar,
    selectedSubView,
    internalPageNumber,
    setInternalPageNumber,
    getQueryString,
    whereClauses,
  } = usePaginatedView()
  const keyPrefix = name || viewName || collectionName
  const currentPageNumber = internalPageNumber || parseInt(pageNumber)
  const [activeFilters] = useFilters(`${keyPrefix}_filters`, filters)
  const [sorting] = useSorting(
    `${keyPrefix}_sorting`,
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

      // TODO: Fix type safety
      let query: any

      // "exact" gives us correct count at a cost of performance
      // "estimated" is better for performance but is always capped at the max read number (1000)
      const selectOptions: {
        count: 'exact' | 'planned' | 'estimated' | null | undefined
      } = { count: 'exact' }

      console.debug(`PaginatedView.getQuery`, {
        collectionName,
        viewName,
        selectedSubView,
        activeFilters,
      })

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
      }

      if (getQuery) {
        query = getQuery(query, selectedSubView, activeFilters)
      }

      for (const activeFilter of activeFilters) {
        switch (activeFilter.type) {
          case FilterType.Equal:
            if ((activeFilter as EqualActiveFilter<any>).value) {
              query = query.eq(
                activeFilter.fieldName,
                (activeFilter as EqualActiveFilter<any>).value
              )
              console.debug(
                `filter eq`,
                activeFilter.fieldName,
                (activeFilter as EqualActiveFilter<any>).value
              )
            }
            break

          case FilterType.NotEqual:
            if ((activeFilter as NotEqualActiveFilter<any>).value) {
              if (activeFilter.subType === FilterSubType.Null) {
                query = query.not(activeFilter.fieldName, 'is', null)

                console.debug(
                  `filter not is`,
                  activeFilter.fieldName,
                  (activeFilter as NotEqualActiveFilter<any>).value
                )
              } else {
                query = query.neq(
                  activeFilter.fieldName,
                  (activeFilter as NotEqualActiveFilter<any>).value
                )

                console.debug(
                  `filter neq`,
                  activeFilter.fieldName,
                  (activeFilter as NotEqualActiveFilter<any>).value
                )
              }
            }
            break

          case FilterType.Multichoice:
            if ((activeFilter as MultichoiceActiveFilter<any, any>).value) {
              query = query.in(
                activeFilter.fieldName,
                (activeFilter as MultichoiceActiveFilter<any, any>).value
              )
              console.debug(
                `filter in`,
                activeFilter.fieldName,
                (activeFilter as MultichoiceActiveFilter<any, any>).value
              )
            }
            break

          default:
            throw new Error(
              `Unknown filter type: ${(activeFilter as any).type}`
            )
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

      console.debug('return query', query)

      return query
    },
    [
      viewName,
      getQuery,
      currentPageNumber,
      sorting ? `${sorting.fieldName}.${sorting.direction}` : null,
      selectedSubView,
      Object.values(activeFilters)
        .map(
          (filter) =>
            `${filter.fieldName}_${(
              filter as EqualActiveFilter<any>
            ).value.toString()}_${filter.direction}`
        )
        .join('+'),
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
      <div className={classes.rendererWrapper}>
        {React.cloneElement<RendererProps<any>>(renderer, {
          items,
          hydrate,
          selectedSubView,
          activeFilters,
        })}
      </div>
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
      <RefreshIcon className={classes.hydrateIcon} onClick={hydrate} />
      {getQueryString ? (
        <Button url={getPathForQueryString(getQueryString())} color="secondary">
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

const clearId = '__clear'

const CommonMetaControl = ({
  label,
  fieldName,
  fieldMap,
}: {
  label: string
  fieldName: string
  fieldMap: { [key: string]: string }
}) => {
  const { filtersKey, filters } = usePaginatedView()
  const [activeFilters, setActiveFilters] = useFilters(filtersKey, filters)

  const onSelect = (newVal: string) => {}
  // setFilters({
  //   [fieldName]: newVal === clearId ? null : newVal,
  // })

  const activeFilter = activeFilters.find(
    (filter) => filter.fieldName === fieldName
  )

  return (
    <ButtonDropdown
      selectedId={activeFilter ? activeFilter.fieldName : clearId}
      options={Object.entries(fieldMap)
        .map(([key, val]) => ({ id: val, label: key }))
        .concat([{ id: clearId, label: 'Default' }])}
      onSelect={onSelect}
      size="small"
      color="secondary"
      label={label}
    />
  )
}

const subViewConfigAll: SubViewConfig[] = [
  {
    label: 'All',
    id: 'all',
  },
]

export interface PaginatedViewProps<TRecord> {
  name?: string
  viewName?: string
  editorViewName?: string
  collectionName?: string
  select?: string
  getQuery?: GetQueryFn<TRecord>
  sortOptions?: SortOption<TRecord>[]
  defaultFieldName?: Extract<keyof TRecord, string>
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
  filters?: Filter<TRecord>[]
}

const PaginatedView = <TRecord,>({
  name, // for sort/filter keys
  viewName,
  editorViewName,
  collectionName,
  select = '*',
  getQuery = undefined,
  sortOptions = [],
  defaultFieldName = undefined,
  defaultDirection,
  children,
  extraControls = [],
  extraControlsLeft = [],
  urlWithPageNumberVar = '',
  createUrl,
  subViews,
  filters,
  showCommonMetaControls = false,
  getQueryString = undefined,
  limit = undefined,
  whereClauses,
}: PaginatedViewProps<TRecord>) => {
  if (!children) {
    throw new Error('Cannot render cached view without a renderer!')
  }

  const keyPrefix = name || viewName || collectionName

  const defaultSubView =
    subViews && subViews.find((subViewConfig) => subViewConfig.defaultActive)

  const [selectedSubView, setSelectedSubView] = useStorage<string | null>(
    `${keyPrefix}_subview`,
    defaultSubView ? defaultSubView.id : null
  )

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
    <ErrorBoundary>
      <PaginatedViewContext.Provider
        value={{
          name,
          viewName,
          editorViewName,
          collectionName,
          select,
          getQuery,
          defaultFieldName,
          defaultDirection,
          renderer: children,
          sortOptions,
          urlWithPageNumberVar,
          subViews,
          selectedSubView,
          filters,
          internalPageNumber,
          setInternalPageNumber,
          getQueryString,
          whereClauses,
        }}>
        <div className={classes.root}>
          <div className={classes.controls}>
            <div className={classes.controlsLeft}>
              {subViews ? (
                <ControlGroup>
                  {subViewConfigAll
                    .concat(subViews)
                    .map(({ label, id }, idx) => (
                      <Fragment key={id}>
                        {idx !== 0 ? <>&nbsp;</> : ''}
                        <Button
                          onClick={() => setSelectedSubView(id)}
                          color="secondary"
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
              <ControlGroup>{extraControlsLeft}</ControlGroup>
            </div>
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
              {extraControls ? (
                <ControlGroup>
                  {extraControls.map((extraControl, idx) => (
                    <Control key={idx}>
                      {React.cloneElement<ButtonProps>(extraControl, {
                        color: 'secondary',
                        size: 'small',
                      })}
                    </Control>
                  ))}
                </ControlGroup>
              ) : null}
              {filters ? (
                <Filters
                  filters={filters}
                  storageKey={`${keyPrefix}_filters`}
                />
              ) : null}
              {sortOptions.length ? (
                <ControlGroup>
                  <Control>
                    <SortControls
                      options={sortOptions}
                      sortKey={`${keyPrefix}_sorting`}
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
    </ErrorBoundary>
  )
}

export default PaginatedView
