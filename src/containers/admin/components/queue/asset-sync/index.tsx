import React, { Fragment, useState } from 'react'
import LaunchIcon from '@mui/icons-material/Launch'
import { keyframes } from '@mui/system'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import styled from '@emotion/styled'

import PaginatedView, { RendererProps } from '@/components/paginated-view'

import {
  ViewNames as AssetsViewNames,
  Asset,
  FullAsset,
  AssetForList,
} from '@/modules/assets'
import {
  CollectionNames as AssetsSyncQueueCollectionNames,
  AssetSyncQueueItem,
  QueueStatus,
} from '@/modules/assetsyncqueue'
import { routes } from '@/routes'
import ResponsiveTable, {
  TableCell,
  TableHead,
  TableRow,
} from '@/components/responsive-table'
import { TableBody } from '@mui/material'
import ShortId from '@/components/short-id'
import NoResultsMessage from '@/components/no-results-message'
import useDataStoreItem from '@/hooks/useDataStoreItem'
import ErrorMessage from '@/components/error-message'
import NoValueLabel from '@/components/no-value-label'
import Link from '@/components/link'
import Tooltip from '@/components/tooltip'
import { getFriendlyDate, getFriendlyDuration } from '@/utils/dates'
import FormattedDate from '@/components/formatted-date'
import AiResultSummary from '@/components/ai-result-summary'
import { VRCArenaTheme } from '@/themes'
import { Operators } from '@/hooks/useDatabaseQuery'
import { useParams, useRouteMatch } from 'react-router'
import Heading from '@/components/heading'

const AssetSyncQueueCellRenderer = ({ item }: { item: AssetSyncQueueItem }) => {
  return (
    <>
      {item.syncedfields === null ? (
        <NoValueLabel>(no synced fields)</NoValueLabel>
      ) : item.createdassetid ? (
        <>
          Created asset:{' '}
          <Link
            to={routes.viewAssetWithVar.replace(
              ':assetId',
              item.createdassetid
            )}>
            view <LaunchIcon />
          </Link>
          <br />
          {item.syncedfields.length} synced fields
        </>
      ) : null}
    </>
  )
}

const AssetSyncQueueFullRenderer = ({ item }: { item: AssetSyncQueueItem }) => {
  if (item.syncedfields === null) return null
  return (
    <>
      Synced:
      <ul>
        {item.syncedfields.map((fieldName) => (
          <li>{fieldName}</li>
        ))}
      </ul>
    </>
  )
}

const fadeBackground = (color: string) => keyframes`
  0% { background-color: ${color}; }
  50% { background-color: ${color}; }
  100%   { background-color: transparent; }
`
const colorNew = `rgba(100,100,100)`

const AssetParentRenderer = ({ item }: { item: AssetSyncQueueItem }) => {
  const [isLoading, lastErrorCode, asset] = useDataStoreItem<AssetForList>(
    AssetsViewNames.GetAssetsForList,
    item.createdassetid || false
  )
  if (lastErrorCode !== null)
    return (
      <ErrorMessage>Failed to load asset (code {lastErrorCode})</ErrorMessage>
    )
  if (isLoading || asset === null)
    return <NoValueLabel>Loading asset...</NoValueLabel>
  if (asset === false)
    return <NoResultsMessage>Asset does not exist</NoResultsMessage>

  return (
    <Link to={routes.viewAssetWithVar.replace(':assetId', asset.id)}>
      {asset.title}
    </Link>
  )
}

const Box = styled.div`
  padding: 0.25rem;
  border: 1px solid rgb(100, 100, 100);
  border-radius: ${({ theme }) => (theme as VRCArenaTheme).shape.borderRadius};
`

const Renderer = ({ items, hydrate }: RendererProps<AssetSyncQueueItem>) => {
  const [expandedId, setExpandedId] = useState<null | string>(null)
  const toggleExpandedId = (id: string) =>
    setExpandedId((currentVal) => (currentVal === id ? null : id))
  return (
    <ResponsiveTable>
      <TableHead>
        <TableRow>
          <TableCell></TableCell>
          <TableCell>URL</TableCell>
          <TableCell style={{ display: 'flex', alignItems: 'center' }}>
            Date <KeyboardArrowDownIcon />
          </TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Result</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {items?.length ? (
          items.map((item, index) => {
            const isExpanded = item.id === expandedId
            return (
              <Fragment key={item.id}>
                <TableRow
                  sx={
                    false
                      ? {
                          animation: `${fadeBackground(
                            colorNew
                          )} 4s ease-out forwards`,
                        }
                      : undefined
                  }>
                  <TableCell>
                    <ShortId>{item.id}</ShortId>
                  </TableCell>
                  <TableCell label="URL">
                    <a
                      href={item.sourceurl}
                      target="_blank"
                      rel="noopener noreferrer">
                      {item.sourceurl} <LaunchIcon />
                    </a>
                  </TableCell>
                  <TableCell label="Date">
                    {item.lastmodifiedat ? (
                      <Tooltip
                        title={
                          <>
                            Created {getFriendlyDate(item.createdat, false)}
                            {item.lastmodifiedat !== null && (
                              <>
                                <br />
                                Modified{' '}
                                {getFriendlyDate(item.lastmodifiedat, false)}
                                <br />
                                Took{' '}
                                {getFriendlyDuration(
                                  item.createdat,
                                  item.lastmodifiedat
                                )}
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
                  <TableCell label="Status">
                    <AiResultSummary
                      queuedItem={item}
                      // connectionStatus={connectionStatus}
                    />
                  </TableCell>
                  <TableCell label="Result">
                    <AssetSyncQueueCellRenderer item={item} />{' '}
                    <KeyboardArrowUpIcon
                      onClick={() => toggleExpandedId(item.id)}
                      style={{
                        cursor: 'pointer',
                        transform: isExpanded ? 'rotate(180deg)' : undefined,
                      }}
                    />
                    <br />
                    {item.notes || <NoValueLabel>(no notes)</NoValueLabel>}
                  </TableCell>
                </TableRow>
                {isExpanded && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Box>
                        <AssetParentRenderer item={item as any} />
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            )
          })
        ) : (
          <TableRow>
            <TableCell colSpan={5}>
              <NoResultsMessage noMargin>No queued items</NoResultsMessage>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </ResponsiveTable>
  )
}

enum SubView {
  All = 'all',
  Queued = 'queued',
  Processing = 'processing',
  Processed = 'processed',
  Failed = 'failed',
}

const AdminAssetSyncQueue = () => {
  const routeMatch = useRouteMatch()
  const params = useParams<any>()

  console.debug(`AdminAssetSyncQueue.render`, { routeMatch, params })

  return (
    <>
      <Heading variant="h1">Queues - Asset Sync</Heading>
      <PaginatedView<AssetSyncQueueItem>
        name="admin-amendments"
        viewName={AssetsSyncQueueCollectionNames.AssetSyncQueue}
        // getQuery={getQuery}
        sortOptions={[
          {
            label: 'Queued At',
            fieldName: 'createdat',
          },
        ]}
        defaultFieldName="createdat"
        // defaultSubView={subViewName || SubView.Pending}
        urlWithSubViewNameAndPageNumberVar={
          '/admin/queues/asset-sync/:subViewName/page/:pageNumber'
        }
        subViews={[
          {
            id: SubView.Queued,
            label: 'Queued',
            where: [['status', Operators.EQUALS, QueueStatus.Queued]],
          },
          {
            id: SubView.Processing,
            label: 'Processing',
            where: [['status', Operators.EQUALS, QueueStatus.Processing]],
          },
          {
            id: SubView.Processed,
            label: 'Processed',
            where: [['status', Operators.EQUALS, QueueStatus.Processed]],
          },
          {
            id: SubView.Failed,
            label: 'Failed',
            where: [['status', Operators.EQUALS, QueueStatus.Failed]],
          },
        ]}
        itemNamePlural="queued items">
        {/* @ts-ignore */}
        <Renderer />
      </PaginatedView>
    </>
  )
}

export default AdminAssetSyncQueue
