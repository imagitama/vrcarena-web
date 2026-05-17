import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import styled from '@emotion/styled'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import LaunchIcon from '@mui/icons-material/Launch'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { keyframes } from '@mui/system'

import CircleIcon from '@mui/icons-material/Circle'
import RefreshIcon from '@mui/icons-material/Refresh'

import { CollectionNames as AssetsCollectionNames } from '@/modules/assets'
import { colorPalette } from '@/config'
import { colorGreyedOut } from '@/themes'
import { routes } from '@/routes'
import { QueuedItem, QueuedItemForRecord } from '@/queues'
import { getFriendlyDate, getFriendlyDuration } from '@/utils/dates'

import {
  ViewNames as AssetsViewNames,
  Asset,
  FullAsset,
} from '@/modules/assets'
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
import {
  CollectionNames as AuditQueueCollectionNames,
  AuditQueueItem,
} from '@/modules/auditqueue'
import {
  CollectionNames as AuditApplyQueueCollectionNames,
  AuditApplyQueueItem,
} from '@/modules/auditapplyqueue'

import useDatabaseQuery, { OrderDirections } from '@/hooks/useDatabaseQuery'
import useDataStoreItemsSync from '@/hooks/useDataStoreItemsSync'
import useDataStoreItem from '@/hooks/useDataStoreItem'

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
import TagChips from '@/components/tag-chips'
import { Renderer as AiSuggestRenderer } from '@/components/ai-suggest-result'
import { Renderer as AiSimilarRenderer } from '@/components/ai-similar-result'
import Link from '@/components/link'

import { getLabelForResult, getPositivityForResult } from '../audit'
import { Renderer as AssetAuditResultRenderer } from '@/components/asset-audit-result'
import ErrorBoundary from '@/components/error-boundary'
import ShortDiff from '@/components/short-diff'

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

const AssetSyncQueueCellRenderer = ({ item }: { item: AssetSyncQueueItem }) => {
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

const AssetSyncQueueParentRenderer = ({
  item,
}: {
  item: AssetSyncQueueItem
}) => {
  const [isLoading, lastErrorCode, asset] = useDataStoreItem<FullAsset>(
    AssetsViewNames.GetFullAssets,
    item.createdassetid || false
  )
  if (lastErrorCode !== null)
    return <ErrorMessage>Failed to load asset ({lastErrorCode})</ErrorMessage>
  if (isLoading) return <NoValueLabel>Loading asset...</NoValueLabel>
  if (asset === null) return '-'
  if (asset === false)
    return (
      <NoResultsMessage>
        Parent asset does not exist ({item.createdassetid})
      </NoResultsMessage>
    )

  return (
    <Link to={routes.viewAssetWithVar.replace(':assetId', asset.id)}>
      {asset.title}
    </Link>
  )
}

const AiSuggestCellRenderer = ({ item }: { item: AiSuggestQueuedItem }) => {
  if (item.suggestions === null)
    return <NoValueLabel>(no suggestions)</NoValueLabel>

  return `${Object.keys(item.suggestions).length} suggestions`
}

const AiSuggestFullRenderer = ({ item }: { item: AiSuggestQueuedItem }) => {
  if (item.suggestions === null) return null
  return <AiSuggestRenderer queuedItem={item} />
}

const AssetParentRenderer = ({ item }: { item: QueuedItemForRecord }) => {
  const [isLoading, lastErrorCode, asset] = useDataStoreItem<Asset>(
    item.recordtable,
    item.recordid
  )
  if (lastErrorCode !== null)
    return (
      <ErrorMessage>Failed to load parent (code {lastErrorCode})</ErrorMessage>
    )
  if (isLoading || asset === null)
    return <NoValueLabel>Loading asset...</NoValueLabel>
  if (asset === false)
    return <NoResultsMessage>Parent does not exist</NoResultsMessage>

  return (
    <Link to={routes.viewAssetWithVar.replace(':assetId', asset.id)}>
      {asset.title}
    </Link>
  )
}

const AiSimilarCellRenderer = ({ item }: { item: AiSimilarQueuedItem }) => {
  if (item.similarities === null)
    return <NoValueLabel>(no similarities)</NoValueLabel>

  return `${Object.keys(item.similarities).length} similarities`
}

const AiSimilarFullRenderer = ({ item }: { item: AiSimilarQueuedItem }) => {
  if (item.similarities === null) return null
  return <AiSimilarRenderer queuedItem={item} />
}

const AiEvaluateCellRenderer = ({ item }: { item: AiEvaluateQueuedItem }) => {
  if (item.score === null || item.tags === null)
    return <NoValueLabel>(no score)</NoValueLabel>

  return (
    <>
      <TagChips tags={item.tags} />
      <Score value={item.score}>{getScoreAsPercentage(item.score)}%</Score>
    </>
  )
}

const AssetAuditCellRenderer = ({ item }: { item: AuditQueueItem }) => {
  if (item.result === null) {
    return <NoValueLabel>(no result)</NoValueLabel>
  }

  return (
    <>
      <StatusText positivity={getPositivityForResult(item.result.result)}>
        {getLabelForResult(item.result.result)}
      </StatusText>
      {item.result.code && (
        <>
          <br />
          Error code: {item.result.code || 'none'}
        </>
      )}
    </>
  )
}

const AssetAuditCellFullRenderer = ({ item }: { item: AuditQueueItem }) => {
  return <AssetAuditResultRenderer queuedItem={item} />
}

const AssetAuditApplyCellRenderer = ({
  item,
}: {
  item: AuditApplyQueueItem<Asset>
}) => {
  if (!item.new) return <NoValueLabel>(nothing applied yet)</NoValueLabel>
  return `${Object.keys(item.new).length} fields`
}

const AssetAuditApplyFullRenderer = ({
  item,
}: {
  item: AuditApplyQueueItem<Asset>
}) => {
  return (
    <ShortDiff
      type="assets"
      oldFields={item.old}
      newFields={item.new}
      onlyNewFields={item.new}
    />
  )
}

const AssetAuditApplyParentRenderer = ({
  item,
}: {
  item: AuditApplyQueueItem<Asset>
}) => {
  if (!item.auditqueueitem) throw new Error('Need a parent ID')

  const [isLoading, lastErrorCode, auditQueueItem] =
    useDataStoreItem<AuditQueueItem>(
      AuditQueueCollectionNames.AuditQueue,
      item.auditqueueitem,
      {
        queryName: `asset-audit-apply_${item.id}_${item.auditqueueitem}`,
      }
    )

  if (auditQueueItem === null || auditQueueItem === false) return null

  return (
    <AssetParentRenderer
      item={{
        ...auditQueueItem,
        recordid: auditQueueItem.parent,
        recordtable: auditQueueItem.parenttable,
      }}
    />
  )
}

//   const [isLoadingAsset, lastErrorCodeAsset, asset] = useDataStoreItem<Asset>(
//     AssetsCollectionNames.Assets,
//     auditQueueItem
//     {
//       queryName: `asset-audit-apply_${item.id}_${item.auditqueueitem}_asset`,
//     }
//   )

//   // console.debug(
//   //   'RENDER!!!!',
//   //   item.auditqueueitem,
//   //   auditQueueItem !== null && auditQueueItem !== false
//   //     ? auditQueueItem.createdassetid
//   //     : false
//   // )

//   if (lastErrorCode !== null)
//     return (
//       <ErrorMessage>Failed to load parent (code {lastErrorCode})</ErrorMessage>
//     )
//   if (lastErrorCodeAsset !== null)
//     return (
//       <ErrorMessage>
//         Failed to load asset (code {lastErrorCodeAsset})
//       </ErrorMessage>
//     )
//   if (isLoading || auditQueueItem === null)
//     return <NoValueLabel>Loading parent...</NoValueLabel>
//   if (auditQueueItem === false)
//     return <NoResultsMessage>Parent does not exist</NoResultsMessage>
//   if (isLoadingAsset || asset === null)
//     return <NoValueLabel>Loading asset...</NoValueLabel>
//   if (asset === false)
//     return <NoResultsMessage>Asset does not exist</NoResultsMessage>

//   return (
//     <Link to={routes.viewAssetWithVar.replace(':assetId', asset.id)}>
//       {asset.title}
//     </Link>
//   )
// }

const colorNew = `rgba(100,100,100)`

interface RowProps<TItem extends Record<string, any>> {
  item: TItem & QueuedItem
  index: number
}

const QueueTable = <TItem extends Record<string, any>>({
  items,
  newItems,
  isLoading,
  renderer: Renderer,
  fullRenderer: FullRenderer,
  parentRenderer: ParentRenderer,
}: {
  collectionName: string
  items: TItem[]
  newItems: TItem[] | null
  isLoading: boolean
  renderer: React.ComponentType<RowProps<TItem>>
  fullRenderer?: React.ComponentType<RowProps<TItem>>
  parentRenderer: React.ComponentType<RowProps<TItem>>
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
          <TableCell>Parent</TableCell>
          <TableCell style={{ display: 'flex', alignItems: 'center' }}>
            Date <KeyboardArrowDownIcon />
          </TableCell>
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
                item={item}
                index={i}
                renderer={Renderer}
                fullRenderer={FullRenderer || Renderer}
                parentRenderer={ParentRenderer}
                isNew
              />
            ))
          : null}
        {items.length ? (
          items.map((item, i) => (
            <QueueTableRow
              key={item.id}
              item={item}
              index={i}
              renderer={Renderer}
              fullRenderer={FullRenderer || Renderer}
              parentRenderer={ParentRenderer}
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

const fadeBackground = (color: string) => keyframes`
  0% { background-color: ${color}; }
  50% { background-color: ${color}; }
  100%   { background-color: transparent; }
`

const QueueTableRow = <TItem extends Record<string, any>>({
  item,
  index,
  isNew,
  parentRenderer: ParentRenderer,
  renderer: Renderer,
  fullRenderer: FullRenderer,
}: {
  item: TItem
  index: number
  isNew?: boolean
  parentRenderer: React.ComponentType<RowProps<TItem>>
  renderer: React.ComponentType<RowProps<TItem>>
  fullRenderer: React.ComponentType<RowProps<TItem>>
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleExpanded = () => setIsExpanded((currentVal) => !currentVal)

  return (
    <>
      <TableRow
        sx={
          isNew
            ? {
                animation: `${fadeBackground(colorNew)} 4s ease-out forwards`,
              }
            : undefined
        }>
        <TableCell>
          <CopyThing text={item.id} title={item.id}>
            {item.id.substring(0, 4)}
          </CopyThing>
        </TableCell>
        <TableCell>
          <ParentRenderer item={item as any} index={index} />
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
          {item.notes || '-'}
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
        renderer={AssetSyncQueueCellRenderer}
        fullRenderer={AssetSyncQueueFullRenderer}
        parentRenderer={AssetSyncQueueParentRenderer}
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
        renderer={AiSuggestCellRenderer}
        fullRenderer={AiSuggestFullRenderer}
        parentRenderer={AssetParentRenderer}
      />
    </Paper>
  )
}

const AiSimilarQueueCell = () => {
  const [isLoading, lastErrorCode, items, hydrate] =
    useDatabaseQuery<AiSimilarQueuedItem>(
      AiSimilarCollectionNames.AiSimilarQueue,
      [],
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
        renderer={AiSimilarCellRenderer}
        fullRenderer={AiSimilarFullRenderer}
        parentRenderer={AssetParentRenderer}
      />
    </Paper>
  )
}

const AiEvaluateQueueCell = () => {
  const [isLoading, lastErrorCode, items, hydrate] =
    useDatabaseQuery<AiEvaluateQueuedItem>(
      AiEvaluateCollectionNames.AiEvaluateQueue,
      [],
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
        renderer={AiEvaluateCellRenderer}
        fullRenderer={AssetParentRenderer}
        parentRenderer={AssetParentRenderer}
      />
    </Paper>
  )
}

const AssetAuditQueueCell = () => {
  const [isLoading, lastErrorCode, items, hydrate] =
    useDatabaseQuery<AuditQueueItem>(AuditQueueCollectionNames.AuditQueue, [], {
      queryName: 'asset-audit-queue-cell',
      orderBy: ['createdat', OrderDirections.DESC],
      limit: DEFAULT_LIMIT,
    })

  const [isSubscribing, isSubscribed, lastErrorCodeSync, liveResults] =
    useDataStoreItemsSync<AuditQueueItem>(
      AuditQueueCollectionNames.AuditQueue,
      { queryName: 'asset-audit-queue-cell_synced' }
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
        Asset Audit
      </CellHeading>
      <QueueTable<AuditQueueItem>
        collectionName={AuditQueueCollectionNames.AuditQueue}
        items={items}
        newItems={liveResults}
        isLoading={isLoading}
        renderer={AssetAuditCellRenderer}
        fullRenderer={AssetAuditCellFullRenderer}
        parentRenderer={({ item }) => (
          <AssetParentRenderer
            item={{
              ...item,
              recordid: item.parent,
              recordtable: item.parenttable,
            }}
          />
        )}
      />
    </Paper>
  )
}

const AssetAuditApplyQueueCell = () => {
  const [isLoading, lastErrorCode, items, hydrate] = useDatabaseQuery<
    AuditApplyQueueItem<Asset>
  >(AuditApplyQueueCollectionNames.AuditApplyQueue, [], {
    queryName: 'audit-queue',
    orderBy: ['createdat', OrderDirections.DESC],
    limit: DEFAULT_LIMIT,
  })

  const [isSubscribing, isSubscribed, lastErrorCodeSync, liveResults] =
    useDataStoreItemsSync<AuditApplyQueueItem<Asset>>(
      AuditApplyQueueCollectionNames.AuditApplyQueue
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
        Asset Audit Apply
      </CellHeading>
      <QueueTable<AuditApplyQueueItem<Asset>>
        collectionName={AuditApplyQueueCollectionNames.AuditApplyQueue}
        items={items}
        newItems={liveResults}
        isLoading={isLoading}
        renderer={AssetAuditApplyCellRenderer}
        fullRenderer={AssetAuditApplyFullRenderer}
        parentRenderer={AssetAuditApplyParentRenderer}
      />
    </Paper>
  )
}

const Cell = styled.div`
  margin-bottom: 0.5rem;
`

const Queue = () => {
  const fiveMinsAgoRef = useRef<Date>(getFiveMinsAgo())
  const fiveMinsAgo = fiveMinsAgoRef.current
  return (
    <>
      <Cell>
        <ErrorBoundary>
          <AssetSyncQueueCell fiveMinsAgo={fiveMinsAgo} />
        </ErrorBoundary>
      </Cell>
      <Cell>
        <ErrorBoundary>
          <AiSuggestQueueCell />
        </ErrorBoundary>
      </Cell>
      <Cell>
        <ErrorBoundary>
          <AiSimilarQueueCell />
        </ErrorBoundary>
      </Cell>
      <Cell>
        <ErrorBoundary>
          <AiEvaluateQueueCell />
        </ErrorBoundary>
      </Cell>
      <Cell>
        <ErrorBoundary>
          <AssetAuditQueueCell />
        </ErrorBoundary>
      </Cell>
      <Cell>
        <ErrorBoundary>
          <AssetAuditApplyQueueCell />
        </ErrorBoundary>
      </Cell>
    </>
  )
}

export default Queue
