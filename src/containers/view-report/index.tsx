import React from 'react'
import { Helmet } from 'react-helmet'
import { useParams } from 'react-router'

import * as routes from '../../routes'
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
  CollectionNames,
  FullReport,
  reportReasonsKeysByCollection,
  ResolutionStatus,
  ViewNames,
} from '../../modules/reports'
import { CollectionNames as AssetsCollectionNames } from '../../modules/assets'
import NoResultsMessage from '../../components/no-results-message'
import WarningMessage from '../../components/warning-message'
import FormattedDate from '../../components/formatted-date'
import ResolutionStatusOutput from '../../components/resolution-status'
import Button from '../../components/button'
import { getUrlForParent } from '../../relations'
import ResolutionControls from '../../components/resolution-controls'
import Markdown from '../../components/markdown'
import useIsEditor from '../../hooks/useIsEditor'
import { getViewNameForParentTable } from '../../utils/reports'

const View = () => {
  const { reportId } = useParams<{ reportId: string }>()
  const isLoggedIn = useIsLoggedIn()
  const isEditor = useIsEditor()

  const [isLoading, lastErrorCode, report, hydrate] =
    useDataStoreItem<FullReport>(
      ViewNames.GetFullReports,
      isLoggedIn ? reportId : false,
      'view-report'
    )
  const [, , parent] = useDataStoreItem(
    report ? getViewNameForParentTable(report.parenttable) || '' : '',
    report ? report.parent : false,
    'view-report-parent'
  )

  if (!isLoggedIn) {
    return <NoPermissionMessage />
  }

  if (isLoading) {
    return <LoadingIndicator message="Loading report..." />
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>Failed to load report (code {lastErrorCode})</ErrorMessage>
    )
  }

  if (!report) {
    return <NoResultsMessage>Report not found</NoResultsMessage>
  }

  const {
    id,
    reason,
    comments,
    parent: parentId,
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
    parentdata: rawParentData,
    resolvedbyusername: resolvedByUsername,
  } = report

  const parentData = parent || rawParentData

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
      <ResolutionStatusOutput
        resolutionStatus={resolutionStatus}
        resolvedAt={resolvedAt}
        resolvedBy={resolvedBy}
        resolvedByUsername={resolvedByUsername}
      />
      {resolutionStatus === ResolutionStatus.Resolved ? (
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
      <Button
        url={getUrlForParent(parentTable, parentId, parentData)}
        color="secondary">
        View Reported Item
      </Button>
      <br />
      <br />
      <GenericOutputItem type={parentTable} id={parentId} data={parentData} />
      <Heading variant="h2">Reason</Heading>
      {reason || '(no reason)'}
      {reason ===
        reportReasonsKeysByCollection[AssetsCollectionNames.Assets]
          .TAKEDOWN && (
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
