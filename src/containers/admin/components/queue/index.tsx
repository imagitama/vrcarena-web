import Column from '@/components/column'
import Columns from '@/components/columns'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import styled from '@emotion/styled'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import LaunchIcon from '@mui/icons-material/Launch'

import CircleIcon from '@mui/icons-material/Circle'
import RefreshIcon from '@mui/icons-material/Refresh'

import {
  CollectionNames as AssetsSyncQueueCollectionNames,
  AssetSyncQueueItem,
} from '@/modules/assetsyncqueue'
import {
  CollectionNames as AiSuggestCollectionNames,
  AiSuggestQueuedItem,
} from '@/modules/aisuggest'
import {
  AiSimilarQueuedItem,
  CollectionNames as AiSimilarCollectionNames,
} from '@/modules/aisimilar'
import {
  AiEvaluateQueuedItem,
  CollectionNames as AiEvaluateCollectionNames,
} from '@/modules/aievaluation'
import { colorPalette } from '@/config'
import { colorGreyedOut } from '@/themes'

import useDatabaseQuery, {
  Operators,
  OrderDirections,
} from '@/hooks/useDatabaseQuery'
import useDataStoreItemSync from '@/hooks/useDataStoreItemSync'
import useDataStoreItemsSync from '@/hooks/useDataStoreItemsSync'

import LoadingShimmer from '@/components/loading-shimmer'
import ErrorMessage from '@/components/error-message'
import CopyThing from '@/components/copy-thing'
import FormattedDate from '@/components/formatted-date'
import NoResultsMessage from '@/components/no-results-message'
import Heading from '@/components/heading'
import Paper from '@/components/paper'
import Tooltip from '@/components/tooltip'
import React, { useRef, useState } from 'react'
import Button from '@/components/button'
import StatusText from '@/components/status-text'
import {
  getPositivityForStatus,
  getScoreAsPercentage,
  getStatusPastTense,
  Score,
} from '@/components/ai-result'
import NoValueLabel from '@/components/no-value-label'
import { getFriendlyDate, getFriendlyDuration } from '@/utils/dates'
import { QueuedItem } from '@/modules/common'
import TagChips from '@/components/tag-chips'
import { Renderer as AiSuggestRenderer } from '@/components/ai-suggest-result'
import { Renderer as AiSimilarRenderer } from '@/components/ai-similar-result'
import { Renderer as AiEvaluateRenderer } from '@/components/ai-evaluation-result'
import Link from '@/components/link'
import { routes } from '@/routes'

const fiveMinsAgo = new Date()
fiveMinsAgo.setMinutes(fiveMinsAgo.getMinutes() - 5)

const getFiveMinsAgo = () => {
  return fiveMinsAgo
}

const LoadingRow = () => (
  <TableRow>
    <TableCell>
      <LoadingShimmer width="100%" height="15px" />
    </TableCell>
    <TableCell>
      <LoadingShimmer width="100%" height="15px" />
    </TableCell>
    <TableCell>
      <LoadingShimmer width="100%" height="15px" />
    </TableCell>
  </TableRow>
)

const ConnectionIcon = styled(CircleIcon)`
  margin: 0 0.25rem;
  font-size: 50% !important;
  color: ${({ positivity }: { positivity: number | null }) =>
    positivity === 1
      ? colorPalette.positive
      : positivity === -1
      ? colorPalette.negative
      : positivity === 0
      ? colorPalette.warning
      : colorGreyedOut};
`

const AssetSyncQueueRenderer = ({ item }: { item: AssetSyncQueueItem }) => {
  return (
    <>
      <a href={item.sourceurl} target="_blank" rel="noopener noreferrer">
        {item.sourceurl} <LaunchIcon />
      </a>
      <br />
      {item.syncedfields === null ? (
        <NoValueLabel>(no synced fields)</NoValueLabel>
      ) : (
        <>
          Created asset{' '}
          <Link
            to={routes.viewAssetWithVar.replace(
              ':assetId',
              item.createdassetid
            )}>
            {item.createdassetid}
          </Link>
          <br />
          {item.syncedfields.length} synced fields
        </>
      )}
    </>
  )
}

const AssetSyncQueueFullRenderer = ({ item }: { item: AssetSyncQueueItem }) => {
  if (item.syncedfields === null) return null
  return (
    <>
      Synced:
      {item.syncedfields.map((fieldName) => (
        <div>{fieldName}</div>
      ))}
    </>
  )
}

const AiSuggestResultCellValue = ({ item }: { item: AiSuggestQueuedItem }) => {
  if (item.suggestions === null)
    return <NoValueLabel>(no suggestions)</NoValueLabel>

  return `${Object.keys(item.suggestions).length} suggestions`
}

const AiSuggestResultFull = ({ item }: { item: AiSuggestQueuedItem }) => {
  if (item.suggestions === null) return null
  return <AiSuggestRenderer queuedItem={item} />
}

const AiSimilarResultCellValue = ({ item }: { item: AiSimilarQueuedItem }) => {
  if (item.similarities === null)
    return <NoValueLabel>(no similarities)</NoValueLabel>

  return `${Object.keys(item.similarities).length} similarities`
}

const AiSimilarResultFull = ({ item }: { item: AiSimilarQueuedItem }) => {
  if (item.similarities === null) return null
  return <AiSimilarRenderer queuedItem={item} />
}

const AiEvaluateResultCellValue = ({
  item,
}: {
  item: AiEvaluateQueuedItem
}) => {
  if (item.score === null || item.tags === null)
    return <NoValueLabel>(no score)</NoValueLabel>

  return (
    <>
      <TagChips tags={item.tags} />
      <Score value={item.score}>{getScoreAsPercentage(item.score)}%</Score>
    </>
  )
}

const AiEvaluateResultFull = ({ item }: { item: AiEvaluateQueuedItem }) => {
  if (item.score === null || item.tags === null) return null

  return <AiEvaluateRenderer queuedItem={item} />
}

const colorNew = `rgba(100,100,100)`

interface RowProps<TItem extends Record<string, any>> {
  item: TItem & QueuedItem
  index: number
}

const QueueTable = <TItem extends Record<string, any>>({
  collectionName,
  items,
  newItems,
  isLoading,
  renderer: Renderer,
  fullRenderer: FullRenderer,
}: {
  collectionName: string
  items: TItem[]
  newItems: TItem[] | null
  isLoading: boolean
  renderer: React.ComponentType<RowProps<TItem>>
  fullRenderer: React.ComponentType<RowProps<TItem>>
}) => {
  if (isLoading) {
    return (
      <>
        <LoadingRow />
        <LoadingRow />
        <LoadingRow />
      </>
    )
  }

  if (!items) {
    return <ErrorMessage>No items</ErrorMessage>
  }

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell></TableCell>
          <TableCell>Date</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Result</TableCell>
          <TableCell>Notes</TableCell>
          <TableCell></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {newItems !== null
          ? newItems.map((item, i) => (
              <QueueTableRow
                key={item.id}
                collectionName={collectionName}
                item={item}
                index={i}
                renderer={Renderer}
                fullRenderer={FullRenderer}
                isNew
              />
            ))
          : null}
        {items.length ? (
          items.map((item, i) => (
            <QueueTableRow
              key={item.id}
              collectionName={collectionName}
              item={item}
              index={i}
              renderer={Renderer}
              fullRenderer={FullRenderer}
            />
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={999}>
              <NoResultsMessage noMargin>No queued items</NoResultsMessage>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

const QueueTableRow = <TItem extends Record<string, any>>({
  collectionName,
  item: staleItem,
  index,
  isNew,
  renderer: Renderer,
  fullRenderer: FullRenderer,
}: {
  collectionName: string
  item: TItem
  index: number
  isNew?: boolean
  renderer: React.ComponentType<RowProps<TItem>>
  fullRenderer: React.ComponentType<RowProps<TItem>>
}) => {
  const [isSubscribing, isSubscribed, lastErrorCode, liveQueuedItem] =
    useDataStoreItemSync<TItem>(
      collectionName,
      staleItem.id,
      `${collectionName}_${staleItem.id}_synced`
    )
  const [isExpanded, setIsExpanded] = useState(false)

  const item: TItem = liveQueuedItem || staleItem

  const toggleExpanded = () => setIsExpanded((currentVal) => !currentVal)

  return (
    <>
      <TableRow style={{ backgroundColor: isNew ? colorNew : undefined }}>
        <TableCell>
          <Tooltip
            title={
              <>
                Subscribing: {isSubscribing ? 'True' : 'False'}
                <br />
                Subscribed: {isSubscribed ? 'True' : 'False'}
                <br />
                Error: {lastErrorCode !== null ? lastErrorCode : 'None'}
              </>
            }>
            <ConnectionIcon
              positivity={
                lastErrorCode !== null
                  ? -1
                  : isSubscribed
                  ? 1
                  : isSubscribing
                  ? 0
                  : null
              }
            />
          </Tooltip>{' '}
          <CopyThing text={item.id} title={item.id}>
            {item.id.substring(0, 4)}
          </CopyThing>
        </TableCell>
        <TableCell>
          {item.lastmodifiedat ? (
            <Tooltip
              title={
                <>
                  Created {getFriendlyDate(item.createdat, false)}
                  {item.lastmodifiedat !== null && (
                    <>
                      <br />
                      Modified {getFriendlyDate(item.lastmodifiedat, false)}
                      <br />
                      Took{' '}
                      {getFriendlyDuration(item.createdat, item.lastmodifiedat)}
                    </>
                  )}
                </>
              }>
              <span>
                <FormattedDate date={item.lastmodifiedat} />*
              </span>
            </Tooltip>
          ) : (
            <FormattedDate date={item.createdat} />
          )}
        </TableCell>
        <TableCell>
          <StatusText positivity={getPositivityForStatus(item.status)}>
            {getStatusPastTense(item.status)}
          </StatusText>
        </TableCell>
        <TableCell>
          <Renderer item={item as any} index={index} />{' '}
          <KeyboardArrowUpIcon onClick={toggleExpanded} />
        </TableCell>
        <TableCell>
          {item.failedreason ? `Reason: ${item.failedreason}` : ''}
          {item.notes || ''}
        </TableCell>
        <TableCell></TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow>
          <TableCell colSpan={999}>
            <FullRenderer item={item as any} index={index} />
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

const DEFAULT_LIMIT = 5

const AssetSyncQueueCell = ({ fiveMinsAgo }: { fiveMinsAgo: Date }) => {
  const [isLoading, lastErrorCode, items, hydrate] =
    useDatabaseQuery<AssetSyncQueueItem>(
      AssetsSyncQueueCollectionNames.AssetSyncQueue,
      [],
      // [['createdat', Operators.GREATER_THAN, fiveMinsAgo.toISOString()]],
      {
        queryName: 'asset-sync-queue-cell',
        orderBy: ['createdat', OrderDirections.DESC],
        limit: DEFAULT_LIMIT,
      }
    )

  const [isSubscribing, isSubscribed, lastErrorCodeSync, liveResults] =
    useDataStoreItemsSync<AssetSyncQueueItem>(
      AssetsSyncQueueCollectionNames.AssetSyncQueue,
      {
        queryName: 'asset-sync-queue_synced',
      }
    )

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>Failed to get items (code {lastErrorCode})</ErrorMessage>
    )
  }

  if (items === null) return null

  return (
    <Paper>
      <CellHeading
        isLoadingStale={isLoading}
        isSubscribing={isSubscribing}
        isSubscribed={isSubscribed}
        lastErrorCode={lastErrorCodeSync}
        onRefresh={hydrate}>
        Asset Sync
      </CellHeading>
      <QueueTable<AssetSyncQueueItem>
        collectionName={AssetsSyncQueueCollectionNames.AssetSyncQueue}
        items={items}
        newItems={liveResults}
        isLoading={isLoading}
        renderer={AssetSyncQueueRenderer}
        fullRenderer={AssetSyncQueueFullRenderer}
      />
    </Paper>
  )
}

const CellHeading = ({
  children,
  isLoadingStale,
  isSubscribing,
  isSubscribed,
  lastErrorCode,
  onRefresh,
}: {
  children: React.ReactNode
  isLoadingStale: boolean
  isSubscribing: boolean
  isSubscribed: boolean
  lastErrorCode: any | null
  onRefresh: () => void
}) => (
  <Heading noMargin variant="h2">
    <Tooltip
      title={
        <>
          Loading: {isLoadingStale ? 'True' : 'False'}
          <br />
          Subscribing: {isSubscribing ? 'True' : 'False'}
          <br />
          Subscribed: {isSubscribed ? 'True' : 'False'}
          <br />
          Error: {lastErrorCode !== null ? lastErrorCode : 'None'}
        </>
      }>
      <ConnectionIcon
        positivity={
          lastErrorCode !== null
            ? -1
            : isSubscribed
            ? 1
            : isSubscribing
            ? 0
            : null
        }
      />
    </Tooltip>{' '}
    {children}{' '}
    <Button
      size="small"
      color="secondary"
      icon={<RefreshIcon />}
      onClick={onRefresh}
      iconOnly
      hollow
    />
    {isLoadingStale && <RefreshIcon />}
  </Heading>
)

const AiSuggestQueueCell = () => {
  const [isLoading, lastErrorCode, items, hydrate] =
    useDatabaseQuery<AiSuggestQueuedItem>(
      AiSuggestCollectionNames.AiSuggestQueue,
      [],
      // [['createdat', Operators.LESS_THAN, getFiveMinsAgo().toISOString()]],
      {
        queryName: 'ai-suggest-queue',
        orderBy: ['createdat', OrderDirections.DESC],
        limit: DEFAULT_LIMIT,
      }
    )

  const [isSubscribing, isSubscribed, lastErrorCodeSync, liveResults] =
    useDataStoreItemsSync<AiSuggestQueuedItem>(
      AiSuggestCollectionNames.AiSuggestQueue
    )

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>Failed to get items (code {lastErrorCode})</ErrorMessage>
    )
  }

  if (items === null) return null

  return (
    <Paper>
      <CellHeading
        isLoadingStale={isLoading}
        isSubscribing={isSubscribing}
        isSubscribed={isSubscribed}
        lastErrorCode={lastErrorCodeSync}
        onRefresh={hydrate}>
        AI Suggest
      </CellHeading>
      <QueueTable<AiSuggestQueuedItem>
        collectionName={AiSuggestCollectionNames.AiSuggestQueue}
        items={items}
        newItems={liveResults}
        isLoading={isLoading}
        renderer={AiSuggestResultCellValue}
        fullRenderer={AiSuggestResultFull}
      />
    </Paper>
  )
}

const AiSimilarQueueCell = () => {
  const [isLoading, lastErrorCode, items, hydrate] =
    useDatabaseQuery<AiSimilarQueuedItem>(
      AiSimilarCollectionNames.AiSimilarQueue,
      [],
      // [['createdat', Operators.GREATER_THAN, getFiveMinsAgo().toISOString()]],
      {
        queryName: 'ai-suggest-queue',
        orderBy: ['createdat', OrderDirections.DESC],
        limit: DEFAULT_LIMIT,
      }
    )

  const [isSubscribing, isSubscribed, lastErrorCodeSync, liveResults] =
    useDataStoreItemsSync<AiSimilarQueuedItem>(
      AiSimilarCollectionNames.AiSimilarQueue
    )

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>Failed to get items (code {lastErrorCode})</ErrorMessage>
    )
  }

  if (items === null) return null

  return (
    <Paper>
      <CellHeading
        isLoadingStale={isLoading}
        isSubscribing={isSubscribing}
        isSubscribed={isSubscribed}
        lastErrorCode={lastErrorCodeSync}
        onRefresh={hydrate}>
        AI Similar
      </CellHeading>
      <QueueTable<AiSimilarQueuedItem>
        collectionName={AiSimilarCollectionNames.AiSimilarQueue}
        items={items}
        newItems={liveResults}
        isLoading={isLoading}
        renderer={AiSimilarResultCellValue}
        fullRenderer={AiSimilarResultFull}
      />
    </Paper>
  )
}

const AiEvaluateQueueCell = () => {
  const [isLoading, lastErrorCode, items, hydrate] =
    useDatabaseQuery<AiEvaluateQueuedItem>(
      AiEvaluateCollectionNames.AiEvaluateQueue,
      [],
      // [['createdat', Operators.GREATER_THAN, getFiveMinsAgo().toISOString()]],
      {
        queryName: 'ai-suggest-queue',
        orderBy: ['createdat', OrderDirections.DESC],
        limit: DEFAULT_LIMIT,
      }
    )

  const [isSubscribing, isSubscribed, lastErrorCodeSync, liveResults] =
    useDataStoreItemsSync<AiEvaluateQueuedItem>(
      AiEvaluateCollectionNames.AiEvaluateQueue
    )

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>Failed to get items (code {lastErrorCode})</ErrorMessage>
    )
  }

  if (items === null) return null

  return (
    <Paper>
      <CellHeading
        isLoadingStale={isLoading}
        isSubscribing={isSubscribing}
        isSubscribed={isSubscribed}
        lastErrorCode={lastErrorCodeSync}
        onRefresh={hydrate}>
        AI Evaluate
      </CellHeading>
      <QueueTable<AiEvaluateQueuedItem>
        collectionName={AiEvaluateCollectionNames.AiEvaluateQueue}
        items={items}
        newItems={liveResults}
        isLoading={isLoading}
        renderer={AiEvaluateResultCellValue}
        fullRenderer={AiEvaluateResultFull}
      />
    </Paper>
  )
}

const Queue = () => {
  const fiveMinsAgoRef = useRef<Date>(getFiveMinsAgo())
  const fiveMinsAgo = fiveMinsAgoRef.current
  return (
    <div>
      <div style={{ marginBottom: '0.5rem' }}>
        <AssetSyncQueueCell fiveMinsAgo={fiveMinsAgo} />
      </div>
      <div style={{ marginBottom: '0.5rem' }}>
        <AiSuggestQueueCell />
      </div>
      <div style={{ marginBottom: '0.5rem' }}>
        <AiSimilarQueueCell />
      </div>
      <div style={{ marginBottom: '0.5rem' }}>
        <AiEvaluateQueueCell />
      </div>
    </div>
  )
}

export default Queue
