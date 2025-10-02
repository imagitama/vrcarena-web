import React from 'react'
import { useParams } from 'react-router'
import { Helmet } from 'react-helmet'

import Heading from '../../components/heading'
import ErrorMessage from '../../components/error-message'
import NoPermissionMessage from '../../components/no-permission-message'
import LoadingIndicator from '../../components/loading-indicator'
import WarningMessage from '../../components/warning-message'
import AssetResultsItem from '../../components/asset-results-item'
import ShortDiff from '../../components/short-diff'
import PageControls from '../../components/page-controls'
import UsernameLink from '../../components/username-link'
import CommentList from '../../components/comment-list'

import useIsEditor from '../../hooks/useIsEditor'
import useDataStoreItem from '../../hooks/useDataStoreItem'
import useUserId from '../../hooks/useUserId'
import AuthorResultsItem from '../../components/author-results-item'
import AmendmentEditorRecordManager from '../../components/amendment-editor-record-manager'
import Message from '../../components/message'
import {
  Asset,
  ViewNames as AssetsViewNames,
  CollectionNames as AssetsCollectionNames,
} from '../../modules/assets'
import {
  Author,
  ViewNames as AuthorsViewNames,
  CollectionNames as AuthorsCollectionNames,
} from '../../modules/authors'
import {
  ViewNames as AmendmentsViewNames,
  CollectionNames as AmendmentsCollectionNames,
  FullAmendment,
} from '../../modules/amendments'
import { CollectionNames as CommentsCollectionNames } from '../../modules/comments'
import { ApprovalStatus } from '../../modules/common'
import NoResultsMessage from '@/components/no-results-message'

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
      <ErrorMessage>Failed to load asset (code {lastErrorCode})</ErrorMessage>
    )
  }

  if (!asset) {
    return <ErrorMessage>Failed to load asset: does not exist</ErrorMessage>
  }

  return <AssetResultsItem asset={asset} />
}

const AuthorOutput = ({ authorId }: { authorId: string }) => {
  const [isLoading, lastErrorCode, author] = useDataStoreItem<Author>(
    AuthorsCollectionNames.Authors,
    authorId,
    { queryName: 'view-amendment-author' }
  )

  if (isLoading) {
    return <LoadingIndicator message="Loading author..." />
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>Failed to load author (code {lastErrorCode})</ErrorMessage>
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
      <ErrorMessage>Failed to load parent (code {lastErrorCode})</ErrorMessage>
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

const View = () => {
  const { amendmentId } = useParams<{ amendmentId: string }>()
  const userId = useUserId()
  const [isLoadingAmendment, lastErrorCode, amendment, hydrate] =
    useDataStoreItem<FullAmendment>(
      AmendmentsViewNames.GetFullAmendments,
      userId ? amendmentId : false,
      { queryName: 'view-amendment' }
    )
  const isEditor = useIsEditor()

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
      <ErrorMessage>
        Failed to load amendment (code {lastErrorCode})
      </ErrorMessage>
    )
  }

  if (!amendment) {
    return <ErrorMessage>Failed to load amendment: does not exist</ErrorMessage>
  }

  const {
    parenttable: parentTable,
    parent: parentId,
    fields: fields,
    comments: comments,
    createdby: createdBy,
    approvalstatus: approvalStatus,
    editornotes: editorNotes,
    createdbyusername: createdByUsername,
  } = amendment

  return (
    <>
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
      <Heading variant="h2">Status</Heading>
      {approvalStatus === ApprovalStatus.Declined
        ? 'Declined'
        : approvalStatus === ApprovalStatus.Waiting
        ? 'Waiting'
        : approvalStatus === ApprovalStatus.Approved
        ? 'Approved & applied'
        : 'Unknown'}
      <Heading variant="h2">Changes</Heading>
      <Changes parentTable={parentTable} parentId={parentId} fields={fields} />
      <Heading variant="h2">Comments</Heading>
      <CommentList
        collectionName={CommentsCollectionNames.Comments}
        parentId={amendmentId}
      />
      {isEditor && (
        <PageControls>
          <AmendmentEditorRecordManager
            amendment={amendment}
            onDone={hydrate}
          />
        </PageControls>
      )}
    </>
  )
}

export default () => (
  <>
    <Helmet>
      <title>View amendment | VRCArena</title>
      <meta
        name="description"
        content="View a specific amendment for an asset, author or something else."
      />
    </Helmet>
    <View />
  </>
)
