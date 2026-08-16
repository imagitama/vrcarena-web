import React, { Fragment, useState } from 'react'
import LaunchIcon from '@mui/icons-material/Launch'
import { keyframes } from '@mui/system'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import styled from '@emotion/styled'

import PaginatedView, { RendererProps } from '@/components/paginated-view'

import {
  CollectionNames as TranslateQueueCollectionNames,
  TranslateQueuedItem,
  QueueStatus,
} from '@/modules/translatequeue'
import { routes } from '@/routes'
import ResponsiveTable, {
  TableCell,
  TableHead,
  TableRow,
} from '@/components/responsive-table'
import { TableBody } from '@mui/material'
import ShortId from '@/components/short-id'
import NoResultsMessage from '@/components/no-results-message'
import NoValueLabel from '@/components/no-value-label'
import Link from '@/components/link'
import Tooltip from '@/components/tooltip'
import { getFriendlyDate, getFriendlyDuration } from '@/utils/dates'
import FormattedDate from '@/components/formatted-date'
import AiResultSummary from '@/components/ai-result-summary'
import { VRCArenaTheme } from '@/themes'
import { Operators } from '@/hooks/useDatabaseQuery'
import Heading from '@/components/heading'
import { AssetTranslationOutput } from '@/components/asset-translations-form'
import DialogButton from '@/components/dialog-button'

const AssetSyncQueueCellRenderer = ({
  item,
}: {
  item: TranslateQueuedItem
}) => {
  return (
    <>
      {item.result?.title}
      {item.result?.description}
    </>
  )
}

const fadeBackground = (color: string) => keyframes`
  0% { background-color: ${color}; }
  50% { background-color: ${color}; }
  100%   { background-color: transparent; }
`
const colorNew = `rgba(100,100,100)`

const Box = styled.div`
  padding: 0.25rem;
  border: 1px solid rgb(100, 100, 100);
  border-radius: ${({ theme }) => (theme as VRCArenaTheme).shape.borderRadius};
`

const Renderer = ({ items }: RendererProps<TranslateQueuedItem>) => {
  const [expandedId, setExpandedId] = useState<null | string>(null)
  const toggleExpandedId = (id: string) =>
    setExpandedId((currentVal) => (currentVal === id ? null : id))
  return (
    <ResponsiveTable>
      <TableHead>
        <TableRow>
          <TableCell></TableCell>
          <TableCell>Parent</TableCell>
          <TableCell>Locale</TableCell>
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
                  <TableCell label="Parent">
                    {item.recordtable || '(no table)'}{' '}
                    {item.recordid || '(no ID)'}
                    <DialogButton
                      dialog={
                        <AssetTranslationOutput
                          locale={'Default (US)'}
                          fields={item.fields}
                        />
                      }
                      size="small"
                      color="secondary">
                      View Fields
                    </DialogButton>
                  </TableCell>
                  <TableCell label="Locale">{item.locale}</TableCell>
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
                    {item.result ? (
                      <DialogButton
                        dialog={
                          <AssetTranslationOutput
                            locale={item.locale}
                            fields={item.result}
                          />
                        }
                        size="small"
                        color="secondary">
                        View Translation
                      </DialogButton>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                </TableRow>
                {isExpanded && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Box>todo</Box>
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
  return (
    <>
      <Heading variant="h1">Queues - Asset Sync</Heading>
      <PaginatedView<TranslateQueuedItem>
        name="admin-translate-queue"
        viewName={TranslateQueueCollectionNames.TranslateQueue}
        // getQuery={getQuery}
        sortOptions={[
          {
            label: 'Queued At',
            fieldName: 'createdat',
          },
        ]}
        defaultFieldName="createdat"
        urlWithSubViewNameAndPageNumberVar={
          '/admin/queues/translate/:subViewName/page/:pageNumber'
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
