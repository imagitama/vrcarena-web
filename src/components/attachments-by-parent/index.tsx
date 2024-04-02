import React from 'react'
import useDatabaseQuery, {
  Operators,
  options,
} from '../../hooks/useDatabaseQuery'
import ErrorMessage from '../error-message'
import NoResultsMessage from '../no-results-message'
import ImageGallery from '../image-gallery'
import { AttachmentReason, FullAttachment } from '../../modules/attachments'
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
  const [isLoading, isError, attachments] = useDatabaseQuery<FullAttachment>(
    'getPublicAttachments',
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

  if (isError || !Array.isArray(attachments)) {
    return <ErrorMessage>Failed to load attachments</ErrorMessage>
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
