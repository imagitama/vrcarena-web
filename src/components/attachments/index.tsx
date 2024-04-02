import React from 'react'
import ImageGallery from '../image-gallery'
import { Attachment, FullAttachment } from '../../modules/attachments'
import NoResultsMessage from '../no-results-message'
import AttachmentCaption from '../attachment-caption'

const Attachments = ({
  ids,
  attachmentsData,
  includeMeta = false,
  includeParents = true,
}: {
  ids: string[]
  attachmentsData: (FullAttachment | Attachment)[]
  includeMeta?: boolean
  includeParents?: boolean
}) => {
  if (!ids.length) {
    return <NoResultsMessage>No attachments found</NoResultsMessage>
  }

  return (
    <ImageGallery
      // @ts-ignore
      images={ids
        .map((id) => {
          const attachment = attachmentsData.find((data) => data.id === id)

          if (!attachment) {
            return null
          }

          return {
            url: attachment.url,
            caption: (
              <AttachmentCaption
                attachment={attachment}
                includeMeta={includeMeta}
                includeParents={includeParents}
              />
            ),
          }
        })
        .filter((item) => item !== null)}
    />
  )
}

export default Attachments
