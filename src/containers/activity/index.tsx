import React, { useCallback, useState } from 'react'
import Link from '../../components/link'
import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import { Helmet } from 'react-helmet'

import FormattedDate from '../../components/formatted-date'
import ErrorMessage from '../../components/error-message'
import LoadingIndicator from '../../components/loading-indicator'
import NoResultsMessage from '../../components/no-results-message'
import Button from '../../components/button'

import useDatabaseQuery, {
  CollectionNames as OldCollectionNames,
  HistoryFieldNames,
  OrderDirections,
  Operators,
  options
} from '../../hooks/useDatabaseQuery'
import { CollectionNames } from '../../data-store'
import * as routes from '../../routes'
import UsernameLink from '../../components/username-link'
import TextInput from '../../components/text-input'
import useIsEditor from '../../hooks/useIsEditor'
import Paper from '../../components/paper'
import useUserId from '../../hooks/useUserId'
import PaginatedView from '../../components/paginated-view'

function HistoryData({ data }: { data: any }) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!data.changes) {
    return <>No data</>
  }

  return (
    <>
      {isExpanded && (
        <div style={{ font: 'monospace' }}>
          {JSON.stringify(data.changes, null, '  ')}
        </div>
      )}
      {!isExpanded && (
        <Button onClick={() => setIsExpanded(currentVal => !currentVal)}>
          View
        </Button>
      )}
    </>
  )
}

function ParentLabel({
  parentTable,
  parentId
}: {
  parentTable: string
  parentId: string
}) {
  const collectionName = parentTable

  if (
    collectionName === OldCollectionNames.Assets ||
    collectionName === OldCollectionNames.AssetMeta
  ) {
    return (
      <Link to={routes.viewAssetWithVar.replace(':assetId', parentId)}>
        {parentId}
      </Link>
    )
  }

  if (parentId) {
    return <>{parentId}</>
  }

  return <>(none)</>
}

const getUrlForEvent = (parentTable: string, parentId: string): string => {
  switch (parentTable) {
    case OldCollectionNames.Assets:
      return routes.viewAssetWithVar.replace(':assetId', parentId)
    case OldCollectionNames.Authors:
      return routes.viewAuthorWithVar.replace(':authorId', parentId)
    case OldCollectionNames.CollectionsForUsers:
      return routes.viewUserWithVar.replace(':userId', parentId)
    case OldCollectionNames.Comments:
      // TODO: Finish
      return routes.viewAssetWithVarAndCommentVar.replace(
        ':commentId',
        parentId
      )
    case OldCollectionNames.DiscordServers:
      return routes.viewDiscordServerWithVar.replace(
        ':discordServerId',
        parentId
      )
    case OldCollectionNames.Endorsements:
      // TODO: Finish
      return routes.viewAssetWithVar.replace(':foo', parentId)
    case OldCollectionNames.Reports:
      return routes.viewReportWithVar.replace(':reportId', parentId)
    case OldCollectionNames.Reviews:
      // TODO: Finish
      return routes.viewAssetWithVarAndTabVar.replace(':assetId', parentId)
    case OldCollectionNames.Species:
      return routes.viewSpeciesWithVar.replace(':speciesId', parentId)
    case OldCollectionNames.Users:
      return routes.viewUserWithVar.replace(':userId', parentId)
    case OldCollectionNames.WishlistsForUsers:
      return routes.viewUserWithVar.replace(':userId', parentId)
    case CollectionNames.Amendments:
      return routes.viewAmendmentWithVar.replace(':amendmentId', parentId)
    case CollectionNames.Events:
      return routes.viewEventWithVar.replace(':eventId', parentId)
    case CollectionNames.Playlists:
      return routes.viewPlaylistWithVar.replace(':playlistId', parentId)
    default:
      return '/#unknown'
  }
}

const getLabelForEvent = (message: string, parentTable: string): string => {
  switch (message) {
    case 'Edit':
      switch (parentTable) {
        case OldCollectionNames.Assets:
          return `Edited an asset`
        case OldCollectionNames.Users:
          return `Edited their profile`
        case OldCollectionNames.Authors:
          return 'Edited an author'
        case OldCollectionNames.CollectionsForUsers:
          return 'Edited their collection'
        case OldCollectionNames.Comments:
          return 'Edited a comment'
        case OldCollectionNames.DiscordServers:
          return 'Edited a Discord server'
        case OldCollectionNames.Endorsements:
          return `Edited an endorsment (should not happen)`
        case OldCollectionNames.Reports:
          return 'Edited a report'
        case OldCollectionNames.Reviews:
          return 'Edited a review'
        case OldCollectionNames.Species:
          return 'Edited a species'
        case OldCollectionNames.WishlistsForUsers:
          return 'Edited their wishlist'
        case CollectionNames.Amendments:
          return `Edited an amendment`
        case CollectionNames.Events:
          return 'Edited an event'
        case CollectionNames.Playlists:
          return 'Edited a playlist'
        default:
          return `Edited: ${parentTable}`
      }
    case 'Create':
      switch (parentTable) {
        case OldCollectionNames.Assets:
          return `Created an asset`
        case OldCollectionNames.Users:
          return `Signed up`
        case OldCollectionNames.Comments:
          return `Created a comment`
        case OldCollectionNames.Authors:
          return 'Created an author'
        case OldCollectionNames.WishlistsForUsers:
          return `Created a wishlist for themselves (should not happen)`
        case OldCollectionNames.CollectionsForUsers:
          return `Created a collection for themselves (should not happen)`
        case OldCollectionNames.Comments:
          return 'Created a comment'
        case OldCollectionNames.DiscordServers:
          return 'Added a Discord server'
        case OldCollectionNames.Endorsements:
          return 'Endorsed something'
        case OldCollectionNames.Reports:
          return 'Created a report'
        case OldCollectionNames.Reviews:
          return 'Created a review'
        case OldCollectionNames.Species:
          return 'Created a species'
        case CollectionNames.Amendments:
          return `Created an amendment`
        case CollectionNames.Events:
          return 'Created an event'
        case CollectionNames.Playlists:
          return 'Created a playlist'
        default:
          return `Created: ${parentTable}`
      }
    default:
      return `Message: ${message}`
  }
}

const EventLabel = ({
  message,
  parent,
  parentTable
}: {
  message: string
  parent: string
  parentTable: string
}) => (
  <Link to={getUrlForEvent(parentTable, parent)}>
    {getLabelForEvent(message, parentTable)}
  </Link>
)

interface HistoryItem {
  id: string
  message: string
  parent: string
  parenttable: string
  data: any
  createdat: Date
  createdby: string
}

const Results = ({
  results,
  includesData
}: {
  results: HistoryItem[]
  includesData: boolean
}) => (
  <Paper>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Event</TableCell>
          {includesData ? <TableCell>Data</TableCell> : null}
          <TableCell>User</TableCell>
          <TableCell>Date</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {results.map(
          ({
            id,
            message,
            parent,
            parenttable: parentTable,
            data,
            createdat: createdAt,
            createdby: createdBy
          }) => (
            <TableRow key={id} title={id}>
              <TableCell>
                <EventLabel
                  message={message}
                  parent={parent}
                  parentTable={parentTable}
                />
              </TableCell>
              {includesData ? (
                <TableCell>
                  {data ? <HistoryData data={data} /> : '(no data)'}
                </TableCell>
              ) : null}
              <TableCell>
                <UsernameLink id={createdBy} username={createdBy} />
              </TableCell>
              <TableCell>
                <FormattedDate date={createdAt} />
              </TableCell>
            </TableRow>
          )
        )}
      </TableBody>
    </Table>
  </Paper>
)

const Renderer = ({ items = [] }: { items?: HistoryItem[] }) => {
  const includesData = useIsEditor()
  return <Results results={items} includesData={includesData} />
}

export default () => {
  const userId = useUserId()
  // const [isFilteringByUsername, setIsFilteringByUsername] = useState(false)
  const [textInput, setTextInput] = useState(userId || '')
  const [createdByFilter, setCreatedByFilter] = useState('')

  const performFilter = () => setCreatedByFilter(textInput)
  const clearFilter = () => setCreatedByFilter('')
  const isEditor = useIsEditor()

  const getQuery = useCallback(
    query => {
      if (createdByFilter) {
        return query.eq(HistoryFieldNames.createdBy, createdByFilter)
      }
      return query
    },
    [createdByFilter, isEditor]
  )

  return (
    <>
      <Helmet>
        <title>View the recent activity around the site | VRCArena</title>
        <meta
          name="description"
          content="Take a look at the actions performed by users on the site including editing assets, profiles and more."
        />
      </Helmet>
      <Paper>
        {/* <Radio
          checked={isFilteringByUsername}
          onChange={e => setIsFilteringByUsername(currentVal => !currentVal)}
        />{' '}
        Username
        <Radio
          checked={!isFilteringByUsername}
          onChange={e => setIsFilteringByUsername(currentVal => !currentVal)}
        />{' '}
        User ID */}
        User ID:{' '}
        <TextInput
          value={textInput}
          onChange={e => setTextInput(e.target.value)}
          size="small"
        />{' '}
        <Button onClick={() => performFilter()}>Filter</Button>{' '}
        <Button onClick={() => clearFilter()} color="default">
          Clear
        </Button>
      </Paper>
      <br />
      {/* @ts-ignore */}
      <PaginatedView
        viewName="getHistoryWithoutData"
        editorViewName="getHistoryWithData"
        // @ts-ignore
        getQuery={getQuery}
        sortKey="history"
        defaultFieldName={HistoryFieldNames.createdAt}
        urlWithPageNumberVar={routes.activityWithPageNumberVar}>
        <Renderer />
      </PaginatedView>
    </>
  )
}
