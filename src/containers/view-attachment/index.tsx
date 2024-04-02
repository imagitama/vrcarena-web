import React from 'react'
import { useParams } from 'react-router'
import ErrorMessage from '../../components/error-message'
import AttachmentOverview from '../../components/attachment-overview'

const ViewAttachmentContainer = () => {
  const { attachmentId } = useParams<{ attachmentId: string }>()

  if (!attachmentId) {
    return <ErrorMessage>Need an ID</ErrorMessage>
  }

  return <AttachmentOverview attachmentId={attachmentId} />
}

export default ViewAttachmentContainer
