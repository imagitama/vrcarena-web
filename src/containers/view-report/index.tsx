import React from 'react'
import { Helmet } from 'react-helmet'
import { useParams } from 'react-router'

import * as routes from '../../routes'
import { CollectionNames } from '../../hooks/useDatabaseQuery'
import useIsLoggedIn from '../../hooks/useIsLoggedIn'

import Link from '../../components/link'
import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import GenericOutputItem from '../../components/generic-output-item'
import Heading from '../../components/heading'
import CommentList from '../../components/comment-list'
import NoPermissionMessage from '../../components/no-permission-message'
import useDataStoreItem from '../../hooks/useDataStoreItem'
import {
  FullReport,
  reportReasonsKeysByCollection,
  ResolutionStatuses
} from '../../modules/reports'
import NoResultsMessage from '../../components/no-results-message'
import WarningMessage from '../../components/warning-message'
import FormattedDate from '../../components/formatted-date'
import ResolutionStatus from '../../components/resolution-status'
import Button from '../../components/button'
import { getUrlForParent } from '../../utils'
import ResolutionControls from '../../components/resolution-controls'
import Markdown from '../../components/markdown'
import useIsEditor from '../../hooks/useIsEditor'

const View = () => {
  const { reportId } = useParams<{ reportId: string }>()
  const isLoggedIn = useIsLoggedIn()
  const isEditor = useIsEditor()

  const [isLoading, isError, report, hydrate] = useDataStoreItem<FullReport>(
    'getFullReports'.toLowerCase(),
    isLoggedIn ? reportId : false,
    'view-report'
  )

  if (!isLoggedIn) {
    return <NoPermissionMessage />
  }

  if (isLoading) {
    return <LoadingIndicator message="Loading report..." />
  }

  if (!report) {
    return <NoResultsMessage>Report not found</NoResultsMessage>
  }

  if (isError) {
    return <ErrorMessage>Failed to load report</ErrorMessage>
  }

  const {
    id,
    reason,
    comments,
    parent,
    parenttable: parentTable,
    createdat,
    createdby,
    // meta
    resolutionstatus: resolutionStatus,
    resolvedat: resolvedAt,
    resolvedby: resolvedBy,
    resolutionnotes: resolutionNotes,
    // view
    createdbyusername: createdByUsername,
    parentdata: parentData,
    resolvedbyusername: resolvedByUsername
  } = report

  const onResolutionStatusChanged = () => hydrate()

  return (
    <>
      <Helmet>
        <title>Report #{reportId} | VRCArena</title>
        <meta
          name="description"
          content={`Read more information about report #${reportId} on the site.`}
        />
      </Helmet>
      <Heading variant="h1">
        <Link to={routes.viewReportWithVar.replace(':reportId', reportId)}>
          Report #{reportId}
        </Link>
      </Heading>
      <Heading variant="h2">Resolution Status</Heading>
      <ResolutionStatus
        resolutionStatus={resolutionStatus}
        resolvedAt={resolvedAt}
        resolvedBy={resolvedBy}
        resolvedByUsername={resolvedByUsername}
      />
      {resolutionStatus === ResolutionStatuses.Resolved ? (
        <>
          <Heading variant="h2">Resolution Notes</Heading>
          <Markdown source={resolutionNotes || ''} />
          <br />
        </>
      ) : null}
      {isEditor ? (
        <>
          <Heading variant="h2">Controls</Heading>
          <ResolutionControls
            id={id}
            existingResolutionStatus={resolutionStatus}
            existingResolutionNotes={resolutionNotes}
            onDone={onResolutionStatusChanged}
          />
        </>
      ) : null}
      <Heading variant="h2">Reported Item</Heading>
      <Button url={getUrlForParent(parentTable, parent, parentData)}>
        View Reported Item
      </Button>
      <br />
      <br />
      <GenericOutputItem type={parentTable} id={parent} data={parentData} />
      <Heading variant="h2">Reason</Heading>
      {reason || '(no reason)'}
      {reason ===
        reportReasonsKeysByCollection[CollectionNames.Assets].TAKEDOWN && (
        <WarningMessage>
          Please ensure this report aligns with our{' '}
          <Link to={routes.takedownPolicy}>takedown policy</Link>.
        </WarningMessage>
      )}
      <Heading variant="h2">Reporter Comments</Heading>
      {comments || '(none)'}
      <Heading variant="h2">Metadata</Heading>
      <FormattedDate date={createdat} />{' '}
      {createdByUsername ? (
        <>
          by{' '}
          <Link to={routes.viewUserWithVar.replace(':userId', createdby)}>
            {createdByUsername}
          </Link>
        </>
      ) : null}
      <Heading variant="h2">Comments</Heading>
      <CommentList
        collectionName={CollectionNames.Reports}
        parentId={reportId}
      />
    </>
  )
}

export default () => (
  <>
    <Helmet>
      <title>View a report | VRCArena</title>
      <meta
        name="description"
        content="Read more information about a report on the site."
      />
    </Helmet>
    <View />
  </>
)
