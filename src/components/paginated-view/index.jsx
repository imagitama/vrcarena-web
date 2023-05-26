import React, {
  Fragment,
  useContext,
  createContext,
  useCallback,
  useState
} from 'react'
import { useParams } from 'react-router'
import { makeStyles } from '@material-ui/core/styles'
import AddIcon from '@material-ui/icons/Add'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'

import SortControls from '../sort-controls'
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
  SpeciesFieldNames,
  AssetFieldNames
} from '../../hooks/useDatabaseQuery'
import { CommonMetaFieldNames } from '../../data-store'

const useStyles = makeStyles({
  root: {
    marginTop: '0.5rem'
  },
  controls: {
    display: 'flex',
    '& > *:first-child': {
      marginLeft: 'auto'
    }
  },
  controlGroup: {
    display: 'flex',
    marginLeft: '1rem'
  },
  control: {
    marginLeft: '0.5rem'
  }
})

const limitPerPage = 50

const PaginatedViewContext = createContext()
export const usePaginatedView = () => useContext(PaginatedViewContext)

const Page = () => {
  const { push } = useHistory()
  const { pageNumber = '1' } = useParams()
  const isEditor = useIsEditor()
  const {
    viewName,
    editorViewName,
    collectionName,
    select,
    getQuery,
    sortKey,
    defaultFieldName,
    defaultDirection,
    renderer,
    urlWithPageNumberVar,
    selectedSubView,
    filters,
    internalPageNumber,
    setInternalPageNumber
  } = usePaginatedView()
  const currentPageNumber = internalPageNumber || parseInt(pageNumber)
  const [sorting] = useSorting(sortKey, defaultFieldName, defaultDirection)
  const pageGetQuery = useCallback(() => {
    const rangeStart = (currentPageNumber - 1) * limitPerPage
    const rangeEnd = rangeStart + limitPerPage - 1
    const isAscending = sorting.direction === OrderDirections.ASC

    let query

    // "exact" gives us correct count at a cost of performance
    // "estimated" is better for performance but is always capped at the max read number (1000)
    const selectOptions = { count: 'exact' }

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
    } else {
      query = supabase.from(collectionName)
      query = query.select(select, selectOptions)
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
    query = query
      .range(rangeStart, rangeEnd)
      .order(sorting.fieldName.toLowerCase(), {
        ascending: isAscending
      })

    // hack
    console.log(sorting.fieldName, SpeciesFieldNames.pluralName)
    if (sorting.fieldName === SpeciesFieldNames.pluralName) {
      query = query.order(AssetFieldNames.title.toLowerCase(), {
        ascending: true
      })
    }

    return query
  }, [
    viewName,
    getQuery,
    currentPageNumber,
    sorting.direction,
    selectedSubView,
    Object.values(filters).join('+'),
    isEditor
  ])
  const [isLoading, isErrored, items, totalCount, hydrate] = useDataStore(
    pageGetQuery,
    `paginated-view-${collectionName || viewName}`
  )

  if (isLoading || !items) {
    return <LoadingIndicator message="Loading page..." />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to load page!</ErrorMessage>
  }

  if (!items.length) {
    return <NoResultsMessage />
  }

  return (
    <>
      {React.cloneElement(renderer, {
        items,
        hydrate
      })}
      <PagesNavigation
        currentPageNumber={currentPageNumber}
        pageCount={Math.ceil(totalCount / limitPerPage)}
        onClickWithPageNumber={newPageNumber =>
          urlWithPageNumberVar
            ? push(urlWithPageNumberVar.replace(':pageNumber', newPageNumber))
            : setInternalPageNumber(newPageNumber)
        }
      />
    </>
  )
}

const ControlGroup = ({ children }) => {
  const classes = useStyles()
  return <div className={classes.controlGroup}>{children}</div>
}

const Control = ({ children }) => {
  const classes = useStyles()
  return <div className={classes.control}>{children}</div>
}

const clearId = 'clear'

const CommonMetaControl = ({ label, fieldName, fieldMap }) => {
  const { filters, setFilters } = usePaginatedView()

  const onSelect = newVal =>
    setFilters({
      [fieldName]: newVal === clearId ? null : newVal
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

export default ({
  viewName,
  editorViewName,
  collectionName,
  select = '*',
  getQuery = undefined,
  sortKey = '',
  sortOptions = [],
  defaultFieldName = '',
  defaultDirection,
  children,
  extraControls = [],
  urlWithPageNumberVar = '',
  createUrl,
  subViews = null,
  showCommonMetaControls = false
}) => {
  if (!children) {
    throw new Error('Cannot render cached view without a renderer!')
  }

  const [selectedSubView, setSelectedSubView] = useState(null)
  const [filters, setFilters] = useState({})
  const classes = useStyles()
  const isEditor = useIsEditor()
  const { pageNumber = '1' } = useParams()

  const currentPageNumber = parseInt(pageNumber)

  // for views that do not want to use the URL to track page number
  // eg users/abc/assets
  const [internalPageNumber, setInternalPageNumber] = useState(
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
        setInternalPageNumber
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
              {[
                {
                  label: 'All',
                  id: null
                }
              ]
                .concat(subViews)
                .map(({ label, id }, idx) => (
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
                  sortKey={sortKey}
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
