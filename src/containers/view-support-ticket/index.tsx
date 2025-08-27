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
  FullSupportTicket,
  ResolutionStatus,
  ViewNames,
} from '../../modules/support-tickets'
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
import EditorBox from '@/components/editor-box'

const View = () => {
  const { supportTicketId } = useParams<{ supportTicketId: string }>()
  const isLoggedIn = useIsLoggedIn()
  const isEditor = useIsEditor()

  const [isLoading, lastErrorCode, supportTicket, hydrate] =
    useDataStoreItem<FullSupportTicket>(
      ViewNames.GetFullSupportTickets,
      isLoggedIn ? supportTicketId : false,
      'view-support-ticket'
    )
  const [, , parent] = useDataStoreItem(
    supportTicket
      ? getViewNameForParentTable(supportTicket.parenttable) || ''
      : '',
    supportTicket ? supportTicket.parent : false,
    'view-support-ticket-parent'
  )

  if (!isLoggedIn) {
    return <NoPermissionMessage />
  }

  if (isLoading) {
    return <LoadingIndicator message="Loading support ticket..." />
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>
        Failed to load support ticket (code {lastErrorCode})
      </ErrorMessage>
    )
  }

  if (!supportTicket) {
    return <NoResultsMessage>Support ticket not found</NoResultsMessage>
  }

  const {
    id,
    category,
    comments,
    answers,
    relatedtable: relatedTable,
    relatedid: relatedId,
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
  } = supportTicket

  const parentData = parent || rawParentData

  const onResolutionStatusChanged = () => hydrate()

  return (
    <>
      <Helmet>
        <title>Support ticket #{supportTicketId} | VRCArena</title>
        <meta
          name="description"
          content={`Read more information about support ticket #${supportTicketId} on the site.`}
        />
      </Helmet>
      <Heading variant="h1">
        <Link
          to={routes.viewSupportTicketWithVar.replace(
            ':supportTicketId',
            supportTicketId
          )}>
          Support Ticket #{supportTicketId}
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
        </>
      ) : null}
      {isEditor ? (
        <>
          <br />
          <EditorBox>
            <Heading variant="h2" noTopMargin>
              Editor Controls
            </Heading>
            <ResolutionControls
              id={id}
              metaCollectionName={CollectionNames.SupportTicketsMeta}
              existingResolutionStatus={resolutionStatus}
              existingResolutionNotes={resolutionNotes}
              onDone={onResolutionStatusChanged}
            />
          </EditorBox>
        </>
      ) : null}
      {relatedTable && relatedId ? (
        <>
          <Heading variant="h2">Related Item</Heading>
          <Button
            url={getUrlForParent(relatedTable, relatedId, parentData)}
            color="secondary">
            View Related Item
          </Button>
          <br />
          <br />
          <GenericOutputItem
            type={relatedTable}
            id={relatedId}
            data={parentData}
          />
        </>
      ) : null}
      <Heading variant="h2">Category</Heading>
      {category}
      <Heading variant="h2">Answers</Heading>
      {answers.length
        ? answers.map((questionAndAnswer) => (
            <div key={questionAndAnswer.question}>
              {questionAndAnswer.question}: {questionAndAnswer.answer}
            </div>
          ))
        : '(no answers)'}
      <Heading variant="h2">Comments</Heading>
      <Markdown source={comments} />
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
        collectionName={CollectionNames.SupportTickets}
        parentId={supportTicketId}
      />
    </>
  )
}

export default () => (
  <>
    <Helmet>
      <title>View a support ticket | VRCArena</title>
      <meta
        name="description"
        content="Read more information about a support ticket on the site."
      />
    </Helmet>
    <View />
  </>
)
