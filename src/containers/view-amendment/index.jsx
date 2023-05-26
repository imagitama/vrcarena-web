import React from 'react'
import { useParams } from 'react-router'
import { Helmet } from 'react-helmet'

import Heading from '../../components/heading'
import ErrorMessage from '../../components/error-message'
import NoPermissionMessage from '../../components/no-permission-message'
import LoadingIndicator from '../../components/loading-indicator'
import SuccessMessage from '../../components/success-message'
import WarningMessage from '../../components/warning-message'
import AssetResultsItem from '../../components/asset-results-item'
import ShortDiff from '../../components/short-diff'
import PageControls from '../../components/page-controls'
import UsernameLink from '../../components/username-link'
import CommentList from '../../components/comment-list'

import {
  CollectionNames as OldCollectionNames,
  ApprovalStatuses,
  PublishStatuses
} from '../../hooks/useDatabaseQuery'
import useIsEditor from '../../hooks/useIsEditor'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import useDataStoreItem from '../../hooks/useDataStoreItem'
import useUserId from '../../hooks/useUserId'
import { handleError } from '../../error-handling'
import { CollectionNames, CommonMetaFieldNames } from '../../data-store'
import EditorRecordManager from '../../components/editor-record-manager'
import {
  AmendmentsFieldNames,
  GetFullAmendmentsFieldNames
} from '../../modules/amendments'
import AuthorResultsItem from '../../components/author-results-item'
import AmendmentEditorRecordManager from '../../components/amendment-editor-record-manager'
import Message from '../../components/message'

const Asset = ({ assetId }) => {
  const [isLoading, isError, asset] = useDataStoreItem(
    OldCollectionNames.Assets,
    assetId,
    'view-amendment-asset'
  )

  if (isLoading) {
    return <LoadingIndicator message="Loading asset..." />
  }

  if (isError || !asset) {
    return <ErrorMessage>Failed to load asset</ErrorMessage>
  }

  return <AssetResultsItem asset={asset} />
}

const Author = ({ authorId }) => {
  const [isLoading, isError, author] = useDataStoreItem(
    OldCollectionNames.Authors,
    authorId,
    'view-amendment-author'
  )

  if (isLoading) {
    return <LoadingIndicator message="Loading author..." />
  }

  if (isError || !author) {
    return <ErrorMessage>Failed to load author</ErrorMessage>
  }

  return <AuthorResultsItem author={author} />
}

const getViewNameForParentTable = parentTable => {
  switch (parentTable) {
    case OldCollectionNames.Assets:
      return 'getfullassets'
    case OldCollectionNames.Authors:
      return 'getfullauthors'
    default:
      throw new Error(`Cannot get view name for parent "${parentTable}"`)
  }
}

const Changes = ({ parentTable, parentId, fields }) => {
  const [isLoading, isError, parent] = useDataStoreItem(
    getViewNameForParentTable(parentTable),
    parentId,
    'view-amendment-changes'
  )

  if (isLoading) {
    return <LoadingIndicator message="Loading parent..." />
  }

  if (isError || !parent) {
    return <ErrorMessage>Failed to load parent</ErrorMessage>
  }

  if (Object.keys(fields).length === 0) {
    return <ErrorMessage>No fields have been changed</ErrorMessage>
  }

  return (
    <ShortDiff
      type={parentTable}
      oldFields={parent}
      newFields={fields}
      onlyNewFields={fields}
    />
  )
}

const Parent = ({ table, id, data }) => {
  switch (table) {
    case OldCollectionNames.Assets:
      return <Asset assetId={id} />
    case OldCollectionNames.Authors:
      return <Author authorId={id} />
    default:
      throw new Error(`Cannot render parent ${table} - ${id} - unsupported`)
  }
}

const View = () => {
  const { amendmentId } = useParams()
  const userId = useUserId()
  const [
    isLoadingAmendment,
    isErroredLoadingAmendment,
    amendment,
    hydrate
  ] = useDataStoreItem(
    'getFullAmendments'.toLowerCase(),
    userId ? amendmentId : false,
    'view-amendment'
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

  if (isErroredLoadingAmendment || amendment === false) {
    return <ErrorMessage>Failed to load amendment</ErrorMessage>
  }

  const {
    [AmendmentsFieldNames.parentTable]: parentTable,
    [AmendmentsFieldNames.parent]: parentId,
    [AmendmentsFieldNames.fields]: fields,
    [AmendmentsFieldNames.comments]: comments,
    [AmendmentsFieldNames.createdBy]: createdBy,
    [CommonMetaFieldNames.approvalStatus]: approvalStatus,
    [CommonMetaFieldNames.editorNotes]: editorNotes,
    [GetFullAmendmentsFieldNames.createdByUsername]: createdByUsername
  } = amendment

  return (
    <>
      {approvalStatus === ApprovalStatuses.Declined && (
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
      {approvalStatus === ApprovalStatuses.Declined
        ? 'Declined'
        : approvalStatus === ApprovalStatuses.Waiting
        ? 'Waiting'
        : approvalStatus === ApprovalStatuses.Approved
        ? 'Approved & applied'
        : 'Unknown'}
      <Heading variant="h2">Changes</Heading>
      <Changes parentTable={parentTable} parentId={parentId} fields={fields} />
      <Heading variant="h2">Comments</Heading>
      <CommentList
        collectionName={OldCollectionNames.Comments}
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
