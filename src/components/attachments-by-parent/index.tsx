import React from 'react'

import useDatabaseQuery, {
  Operators,
  options,
} from '../../hooks/useDatabaseQuery'
import {
  AttachmentReason,
  FullAttachment,
  ViewNames,
} from '../../modules/attachments'

import ErrorMessage from '../error-message'
import NoResultsMessage from '../no-results-message'
import ImageGallery from '../image-gallery'
import Attachments from '../attachments'

const LoadingGallery = () => {
  return <ImageGallery showLoadingCount={3} />
}

const AttachmentsByParent = ({
  reason,
  parentTable,
  parentId,
  createdBy = undefined,
  includeMeta = undefined,
  includeParents = undefined,
}: {
  reason: AttachmentReason
  // optional for user page
  parentTable?: string
  parentId?: string
  createdBy?: string
  // if to render label "for asset X"
  includeMeta?: boolean
  includeParents?: boolean
}) => {
  const [isLoading, lastErrorCode, attachments] =
    useDatabaseQuery<FullAttachment>(
      ViewNames.GetPublicAttachments,
      // @ts-ignore
      [['reason', Operators.EQUALS, reason]].concat(
        createdBy
          ? [['createdby', Operators.EQUALS, createdBy!]]
          : parentTable && parentId
          ? [
              ['parenttable', Operators.EQUALS, parentTable],
              ['parentid', Operators.EQUALS, parentId],
            ]
          : []
      ),
      {
        [options.queryName]: 'attachments',
        [options.subscribe]: true,
      }
    )

  if (isLoading) {
    return <LoadingGallery />
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>
        Failed to load attachments (code {lastErrorCode})
      </ErrorMessage>
    )
  }

  if (!Array.isArray(attachments)) {
    return (
      <ErrorMessage>Failed to load attachments (invalid items)</ErrorMessage>
    )
  }

  if (!attachments.length) {
    return <NoResultsMessage>No user attachments found</NoResultsMessage>
  }

  return (
    <Attachments
      ids={attachments.map((attachment) => attachment.id)}
      attachmentsData={attachments}
      includeMeta={includeMeta}
      includeParents={includeParents}
    />
  )
}

export default AttachmentsByParent
