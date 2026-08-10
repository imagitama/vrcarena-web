import React from 'react'
import EditIcon from '@mui/icons-material/Edit'

import Table from '@/components/responsive-table'
import TableBody from '@mui/material/TableBody'
import { TableCell } from '@/components/responsive-table'
import { TableHead } from '@/components/responsive-table'
import { TableRow } from '@/components/responsive-table'

import {
  AdminQueueItem,
  AdminQueueItemType,
  ViewNames,
} from '@/modules/admin-queue'
import { CollectionNames as PagesCollectionNames, Page } from '@/modules/pages'
import * as routes from '@/routes'
import { capitalize } from '@/utils'

import useDataStoreItem from '@/hooks/useDataStoreItem'
import useDataStoreItems from '@/hooks/useDataStoreItems'

import Markdown from '@/components/markdown'
import LoadingIndicator from '@/components/loading-indicator'
import ErrorMessage from '@/components/error-message'
import Button from '@/components/button'
import Heading from '@/components/heading'
import Column from '@/components/column'
import Columns from '@/components/columns'
import Link from '@/components/link'
import FormattedDate from '@/components/formatted-date'
import UsernameLink from '@/components/username-link'
import GenericOutputLabel from '@/components/generic-output-label'
import FormControls from '@/components/form-controls'
import Whiteboard from '@/components/whiteboard'
import ErrorBoundary from '@/components/error-boundary'
import Paper from '@/components/paper'
import NoResultsMessage from '@/components/no-results-message'
import ShortId from '@/components/short-id'
import { mediaQueryForTabletsOrBelow } from '@/media-queries'

const parentName = 'admin'
const pageName = 'notepad'

const Notepad = () => {
  const [isLoading, lastErrorCode, page] = useDataStoreItem<Page>(
    PagesCollectionNames.Pages,
    pageName,
    { queryName: 'admin-home' }
  )

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (lastErrorCode || !page) {
    return <ErrorMessage>Failed to load page</ErrorMessage>
  }

  return (
    <>
      <Markdown source={page.content} />
      <Button
        url={routes.editPageWithParentAndPageVar
          .replace(':parentName', parentName)
          .replace(':pageName', pageName)}
        color="secondary"
        size="small"
        icon={<EditIcon />}
        iconOnly
      />
    </>
  )
}

const QueueItemLabel = ({ queueItem }: { queueItem: AdminQueueItem }) => {
  switch (queueItem.type) {
    case AdminQueueItemType.Asset:
      return (
        <>
          <Link
            to={routes.viewAssetWithVar.replace(
              ':assetId',
              queueItem.record.id
            )}>
            {queueItem.record.title}
          </Link>{' '}
          by{' '}
          <Link
            to={routes.viewAuthorWithVar.replace(
              ':authorId',
              queueItem.record.author || 'NO_AUTHOR'
            )}>
            {queueItem.record.authorname}
          </Link>
          <br />
          Created by{' '}
          <UsernameLink
            username={queueItem.record.createdbyusername}
            id={queueItem.record.createdby}
          />
          <br />
          Published by{' '}
          <UsernameLink
            username={queueItem.record.publishedbyusername}
            id={queueItem.record.publishedby!}
          />
        </>
      )
    case AdminQueueItemType.Amendment:
      return (
        <>
          <Link
            to={routes.viewAmendmentWithVar.replace(
              ':amendmentId',
              queueItem.record.id
            )}>
            #{queueItem.record.id}
          </Link>
          <br />
          <GenericOutputLabel
            id={queueItem.record.parent}
            type={queueItem.record.parenttable}
            data={queueItem.record.parentdata}
          />
        </>
      )
    case AdminQueueItemType.Report:
      return (
        <>
          <Link
            to={routes.viewReportWithVar.replace(
              ':reportId',
              queueItem.record.id
            )}>
            #{queueItem.record.id}
          </Link>{' '}
          by{' '}
          <UsernameLink
            username={queueItem.record.createdbyusername}
            id={queueItem.record.createdby}
          />
          <br />
          <GenericOutputLabel
            id={queueItem.record.parent}
            type={queueItem.record.parenttable}
            data={queueItem.record.parentdata}
          />
        </>
      )
    case AdminQueueItemType.Avatar:
      return (
        <>
          {queueItem.record.vrchatavatarid}
          <br />
          for{' '}
          <Link
            to={routes.viewAssetWithVar.replace(
              ':assetId',
              queueItem.record.asset
            )}>
            {queueItem.record.assetdata?.title || '(untitled asset)'}
          </Link>
        </>
      )
    default:
      // @ts-ignore
      return <>Unknown type "{queueItem.type}"</>
  }
}

const AdminQueue = () => {
  const [isLoading, lastErrorCode, queueItems] =
    useDataStoreItems<AdminQueueItem>(ViewNames.GetAdminQueue, undefined)

  if (isLoading) {
    return <LoadingIndicator message="Loading queue..." />
  }

  if (lastErrorCode || !queueItems) {
    return <ErrorMessage>Failed to load queue</ErrorMessage>
  }

  return (
    <Paper>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell width="10%"></TableCell>
            <TableCell width="15%">Type</TableCell>
            <TableCell width="55%">Item</TableCell>
            <TableCell width="20%">Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {queueItems.length > 0 ? (
            queueItems.map((queueItem) => (
              <TableRow key={queueItem.record.id}>
                <TableCell>
                  <ShortId>{queueItem.id.toString()}</ShortId>
                </TableCell>
                <TableCell label="Type">{capitalize(queueItem.type)}</TableCell>
                <TableCell label="Item">
                  <QueueItemLabel queueItem={queueItem} />
                </TableCell>
                <TableCell label="Date">
                  <FormattedDate date={queueItem.createdat} />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={999}>
                <NoResultsMessage>No items in the queue</NoResultsMessage>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Paper>
  )
}

export default () => {
  return (
    <>
      <Heading variant="h1">Admin</Heading>
      <Heading variant="h2">Queue Overview</Heading>
      <ErrorBoundary>
        <AdminQueue />
      </ErrorBoundary>
      <Heading variant="h2">Notepad</Heading>
      <ErrorBoundary>
        <Whiteboard />
      </ErrorBoundary>
      <ErrorBoundary>
        <Notepad />
      </ErrorBoundary>
    </>
  )
}
