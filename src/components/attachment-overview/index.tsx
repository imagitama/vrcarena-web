import React from 'react'
import useDataStoreItem from '../../hooks/useDataStoreItem'
import {
  FullAttachment,
  CollectionNames,
  ViewNames,
} from '../../modules/attachments'
import LoadingIndicator from '../loading-indicator'
import NoResultsMessage from '../no-results-message'
import AttachmentOutput from '../attachment'
import ErrorMessage from '../error-message'
import EditorRecordManager from '../editor-record-manager'
import useIsEditor from '../../hooks/useIsEditor'
import AttachmentCaption from '../attachment-caption'
import PublicEditorNotes from '../public-editor-notes'

const AttachmentOverview = ({ attachmentId }: { attachmentId: string }) => {
  const [isLoading, isError, attachment, hydrate] =
    useDataStoreItem<FullAttachment>(ViewNames.GetFullAttachments, attachmentId)
  const isEditor = useIsEditor()

  if (isLoading) {
    return <LoadingIndicator message="Loading attachment..." />
  }

  if (isError) {
    return <ErrorMessage>Failed to load attachment</ErrorMessage>
  }

  if (!attachment) {
    return <NoResultsMessage>Attachment not found</NoResultsMessage>
  }

  return (
    <>
      {attachment.editornotes && (
        <PublicEditorNotes notes={attachment.editornotes} />
      )}
      <AttachmentOutput attachment={attachment} width="100%" />
      <br />
      <br />
      <AttachmentCaption attachment={attachment} includeMeta includeParents />
      {isEditor && (
        <>
          <br />
          <EditorRecordManager
            id={attachment.id}
            metaCollectionName={CollectionNames.AttachmentsMeta}
            existingApprovalStatus={attachment.approvalstatus}
            existingAccessStatus={attachment.accessstatus}
            existingEditorNotes={attachment.editornotes}
            showPublishButtons={false}
            onDone={hydrate}
          />
        </>
      )}
    </>
  )
}

export default AttachmentOverview
