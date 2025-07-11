import React from 'react'
import EditIcon from '@mui/icons-material/Edit'

import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

import Markdown from '../../../../components/markdown'
import LoadingIndicator from '../../../../components/loading-indicator'
import ErrorMessage from '../../../../components/error-message'
import useDataStoreItem from '../../../../hooks/useDataStoreItem'
import {
  CollectionNames as PagesCollectionNames,
  Page,
} from '../../../../modules/pages'
import Button from '../../../../components/button'
import * as routes from '../../../../routes'
import Heading from '../../../../components/heading'
import Column from '../../../../components/column'
import Columns from '../../../../components/columns'
import Link from '../../../../components/link'
import useDataStoreItems from '../../../../hooks/useDataStoreItems'
import { capitalize } from '../../../../utils'
import FormattedDate from '../../../../components/formatted-date'
import UsernameLink from '../../../../components/username-link'
import GenericOutputLabel from '../../../../components/generic-output-label'
import FormControls from '../../../../components/form-controls'
import {
  AdminQueueItem,
  AdminQueueItemType,
  ViewNames,
} from '../../../../modules/admin-queue'

const parentName = 'admin'
const pageName = 'notepad'

const Notepad = () => {
  const [isLoading, lastErrorCode, page] = useDataStoreItem<Page>(
    PagesCollectionNames.Pages,
    pageName,
    'admin-home'
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
              queueItem.record.author
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
              queueItem.record.id
            )}>
            {queueItem.record.asset}
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
            <TableCell>#</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {queueItems.length > 0 ? (
            queueItems.map((queueItem) => (
              <TableRow key={queueItem.record.id}>
                <TableCell>{queueItem.id}</TableCell>
                <TableCell>{capitalize(queueItem.type)}</TableCell>
                <TableCell>
                  <QueueItemLabel queueItem={queueItem} />
                </TableCell>
                <TableCell>
                  <FormattedDate date={queueItem.createdat} />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={999}>
                <FormControls>
                  <em>No items in queue</em>
                </FormControls>
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
      <Columns padding>
        <Column width={50} padding>
          <Heading variant="h2">Queue Overview</Heading>
          <AdminQueue />
        </Column>
        <Column width={50} padding>
          <Heading variant="h2">Notepad</Heading>
          <Notepad />
        </Column>
      </Columns>
    </>
  )
}
