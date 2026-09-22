import React, { useState } from 'react'
import { useParams } from 'react-router'
import { Helmet } from '@unhead/react/helmet'
import { v4 as uuidv4 } from 'uuid'

import {
  Asset,
  ViewNames as AssetsViewNames,
  CollectionNames as AssetsCollectionNames,
} from '@/modules/assets'
import {
  Author,
  ViewNames as AuthorsViewNames,
  CollectionNames as AuthorsCollectionNames,
  AuthorForList,
} from '@/modules/authors'
import {
  ViewNames as AmendmentsViewNames,
  FullAmendment,
  CollectionNames as AmendmentsCollectionNames,
  CollectionNames,
} from '@/modules/amendments'
import { AccessStatus, ApprovalStatus } from '@/modules/common'

import useIsEditor from '@/hooks/useIsEditor'
import useDataStoreItem from '@/hooks/useDataStoreItem'
import useUserId from '@/hooks/useUserId'

import AuthorResultsItem from '@/components/author-results-item'
import AmendmentEditorRecordManager from '@/components/amendment-editor-record-manager'
import Message from '@/components/message'
import NoResultsMessage from '@/components/no-results-message'
import Heading from '@/components/heading'
import ErrorMessage from '@/components/error-message'
import NoPermissionMessage from '@/components/no-permission-message'
import LoadingIndicator from '@/components/loading-indicator'
import WarningMessage from '@/components/warning-message'
import AssetResultsItem from '@/components/asset-results-item'
import ShortDiff from '@/components/short-diff'
import PageControls from '@/components/page-controls'
import UsernameLink from '@/components/username-link'
import CommentList from '@/components/comment-list'
import DeleteMyAmendmentButton from '@/components/delete-my-amendment-button'
import { capitalize } from '@/utils'
import FormattedDate from '@/components/formatted-date'
import AdminGenericHistory from '@/components/admin-generic-history'
import StatusChanges from '@/components/status-changes'
import {
  FullSubEditorResponse,
  ViewNames as SubEditorResponsesViewNames,
} from '@/modules/subeditorresponses'
import useDatabaseQuery, {
  Operators,
  OrderDirections,
} from '@/hooks/useDatabaseQuery'
import { SubEditor as SubEditorIcon } from '@/icons'
import SubEditorResults from '@/components/sub-editor-results'
import SubEditorResponseForm from '@/components/sub-editor-response-form'
import { SubEditorStatus } from '@/modules/users'
import useUserRecord from '@/hooks/useUserRecord'

const useSubEditorResponsesForAmendment = (
  amendmentId: string | false,
  cacheKey?: string
): FullSubEditorResponse[] => {
  const [, , results] = useDatabaseQuery<FullSubEditorResponse>(
    SubEditorResponsesViewNames.GetFullSubEditorResponses,
    [
      ['parenttable', Operators.EQUALS, AmendmentsCollectionNames.Amendments],
      ['parentid', Operators.EQUALS, amendmentId],
    ],
    {
      cacheKey,
      orderBy: ['createdat', OrderDirections.DESC],
    }
  )

  return results || []
}

const AssetOutput = ({ assetId }: { assetId: string }) => {
  const [isLoading, lastErrorCode, asset] = useDataStoreItem<Asset>(
    AssetsCollectionNames.Assets,
    assetId,
    { queryName: 'view-amendment-asset' }
  )

  if (isLoading) {
    return <LoadingIndicator message="Loading asset..." />
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage errorCode={lastErrorCode}>
        Failed to load asset
      </ErrorMessage>
    )
  }

  if (!asset) {
    return <ErrorMessage>Failed to load asset: does not exist</ErrorMessage>
  }

  return <AssetResultsItem asset={asset} />
}

const AuthorOutput = ({ authorId }: { authorId: string }) => {
  const [isLoading, lastErrorCode, author] = useDataStoreItem<AuthorForList>(
    AuthorsViewNames.GetAuthorsForList,
    authorId,
    { queryName: 'view-amendment-author' }
  )

  if (isLoading) {
    return <LoadingIndicator message="Loading author..." />
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage errorCode={lastErrorCode}>
        Failed to load author
      </ErrorMessage>
    )
  }

  if (!author) {
    return <ErrorMessage>Failed to load author: does not exist</ErrorMessage>
  }

  return <AuthorResultsItem author={author} />
}

const getViewNameForParentTable = (parentTable: string): string => {
  switch (parentTable) {
    case AssetsCollectionNames.Assets:
      return AssetsViewNames.GetFullAssets
    case AuthorsCollectionNames.Authors:
      return AuthorsViewNames.GetFullAuthors
    default:
      throw new Error(`Cannot get view name for parent "${parentTable}"`)
  }
}

const Changes = ({
  parentTable,
  parentId,
  fields,
}: {
  parentTable: string
  parentId: string
  fields: any
}) => {
  const [isLoading, lastErrorCode, parent] = useDataStoreItem(
    getViewNameForParentTable(parentTable),
    parentId,
    { queryName: 'view-amendment-changes' }
  )

  if (isLoading) {
    return <LoadingIndicator message="Loading parent..." />
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage errorCode={lastErrorCode}>
        Failed to load parent
      </ErrorMessage>
    )
  }

  if (!parent) {
    return <ErrorMessage>Failed to load parent: does not exist</ErrorMessage>
  }

  if (Object.keys(fields).length === 0) {
    return <NoResultsMessage>No fields have been changed</NoResultsMessage>
  }

  return (
    <ShortDiff
      type={parentTable as any}
      oldFields={parent}
      newFields={fields}
      onlyNewFields={fields}
    />
  )
}

const Parent = ({ table, id }: { table: string; id: string }) => {
  switch (table) {
    case AssetsCollectionNames.Assets:
      return <AssetOutput assetId={id} />
    case AuthorsCollectionNames.Authors:
      return <AuthorOutput authorId={id} />
    default:
      throw new Error(`Cannot render parent ${table} - ${id} - unsupported`)
  }
}

const getCacheKey = () => uuidv4()

const View = () => {
  const { amendmentId } = useParams<{ amendmentId: string }>()
  const userId = useUserId()
  const [isLoadingAmendment, lastErrorCode, amendment, hydrate] =
    useDataStoreItem<FullAmendment<any>>(
      AmendmentsViewNames.GetFullAmendments,
      userId ? amendmentId : false,
      { queryName: 'view-amendment' }
    )
  const [cacheKey, setCacheKey] = useState('')
  const isEditor = useIsEditor()
  const subEditorResponses = useSubEditorResponsesForAmendment(
    amendmentId,
    cacheKey
  )
  const [, , user] = useUserRecord()

  if (!userId) {
    return <NoPermissionMessage />
  }

  if (!amendmentId) {
    return <ErrorMessage>Must provide an amendment ID</ErrorMessage>
  }

  if (isLoadingAmendment || amendment === null) {
    return <LoadingIndicator message="Loading amendment..." />
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage errorCode={lastErrorCode}>
        Failed to load amendment
      </ErrorMessage>
    )
  }

  if (!amendment) {
    return (
      <ErrorMessage>Failed to load amendment: it does not exist</ErrorMessage>
    )
  }

  const {
    parenttable: parentTable,
    parent: parentId,
    fields: fields,
    comments: comments,
    createdby: createdBy,
    accessstatus: accessStatus,
    approvalstatus: approvalStatus,
    editornotes: editorNotes,
    createdbyusername: createdByUsername,
  } = amendment

  return (
    <>
      {approvalStatus === ApprovalStatus.Waiting &&
      user?.subeditorstatus === SubEditorStatus.Accepted ? (
        <SubEditorResponseForm
          parentType={AmendmentsCollectionNames.Amendments}
          parentId={amendmentId}
          hydrate={() => {
            setCacheKey(getCacheKey)
            hydrate()
          }}
        />
      ) : null}
      {subEditorResponses.length > 0 ? (
        <Message icon={<SubEditorIcon />}>
          There are {subEditorResponses.length} community responses for this
          amendment:
          <SubEditorResults items={subEditorResponses} showParents={false} />
        </Message>
      ) : null}
      {approvalStatus === ApprovalStatus.Declined && (
        <WarningMessage>
          This amendment has been declined. Please read our comments.
        </WarningMessage>
      )}
      {editorNotes && (
        <Message>
          <strong>Notes from our staff</strong>
          <br />
          <br />
          {editorNotes}
        </Message>
      )}
      <Heading variant="h1">Amendment</Heading>
      <Heading variant="h2">Parent</Heading>
      <Parent table={parentTable} id={parentId} />
      <Heading variant="h2">Creator</Heading>
      <UsernameLink id={createdBy} username={createdByUsername} />
      <Heading variant="h2">Original Comments</Heading>
      {comments || '(none)'}
      <Heading variant="h2">Access Status</Heading>
      {capitalize(accessStatus)}
      {createdBy === userId ? (
        <>
          <br />
          <br />
          <DeleteMyAmendmentButton
            amendmentId={amendmentId}
            isDisabled={
              accessStatus === AccessStatus.Deleted ||
              approvalStatus !== ApprovalStatus.Waiting
            }
            onDone={hydrate}
          />
        </>
      ) : null}
      <Heading variant="h2">Approval Status</Heading>
      {approvalStatus === ApprovalStatus.Declined
        ? 'Declined'
        : approvalStatus === ApprovalStatus.Waiting
        ? 'Waiting'
        : approvalStatus === ApprovalStatus.Quarantined
        ? 'Quarantined'
        : approvalStatus === ApprovalStatus.Approved
        ? 'Approved & applied'
        : 'Unknown'}
      <Heading variant="h2">Metadata</Heading>
      Created <FormattedDate date={amendment.createdat} /> by{' '}
      <UsernameLink
        id={amendment.createdby}
        username={amendment.createdbyusername}
        // avatarUrl={amendment.createdbyavatarurl}
      />
      {amendment.lastmodifiedby && amendment.lastmodifiedat && (
        <>
          <br />
          Modified <FormattedDate date={amendment.lastmodifiedat} /> by{' '}
          <UsernameLink
            id={amendment.lastmodifiedby}
            username={amendment.lastmodifiedbyusername || '(no username)'}
            // avatarUrl={amendment.lastmodifiedbyavatarurl}
          />
        </>
      )}
      <Heading variant="h2">Changes</Heading>
      <Changes parentTable={parentTable} parentId={parentId} fields={fields} />
      <Heading variant="h2">Comments</Heading>
      <CommentList
        collectionName={AmendmentsCollectionNames.Amendments}
        parentId={amendmentId}
      />
      {isEditor && (
        <>
          <PageControls>
            <AmendmentEditorRecordManager
              amendment={amendment}
              onDone={hydrate}
            />
          </PageControls>
          <AdminGenericHistory
            id={amendment.id}
            type={CollectionNames.Amendments}
            metaType={CollectionNames.AmendmentsMeta}
          />
          <StatusChanges statusChanges={amendment.statuschanges || {}} />
        </>
      )}
    </>
  )
}

export default () => (
  <>
    <Helmet>
      <title>View amendment</title>
      <meta
        name="description"
        content="View a specific amendment for an asset, author or something else."
      />
    </Helmet>
    <View />
  </>
)
