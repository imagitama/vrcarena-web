import React, { Suspense } from 'react'
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
import Link from '@/components/link'
import FormattedDate from '@/components/formatted-date'
import UsernameLink from '@/components/username-link'
import GenericOutputLabel from '@/components/generic-output-label'
import Whiteboard from '@/components/whiteboard'
import ErrorBoundary from '@/components/error-boundary'
import Paper from '@/components/paper'
import NoResultsMessage from '@/components/no-results-message'
import ShortId from '@/components/short-id'
import AdminQueue from '@/components/admin-queue'

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

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage errorCode={lastErrorCode}>Failed to load page</ErrorMessage>
    )
  }

  if (!page) {
    return <ErrorMessage>Failed to load page: not found</ErrorMessage>
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

export default () => {
  return (
    <>
      <Heading variant="h1">Admin</Heading>
      <Heading variant="h2">Queue Overview</Heading>
      <Suspense
        fallback={<LoadingIndicator message="Loading admin queue..." />}>
        <ErrorBoundary>
          <AdminQueue />
        </ErrorBoundary>
      </Suspense>
      <Heading variant="h2">Notepad</Heading>
      <Suspense
        fallback={
          <LoadingIndicator message="Loading whiteboard and notepad..." />
        }>
        <ErrorBoundary>
          <Whiteboard />
        </ErrorBoundary>
        <ErrorBoundary>
          <Notepad />
        </ErrorBoundary>
      </Suspense>
    </>
  )
}
