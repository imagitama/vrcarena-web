import React, { useEffect, useState } from 'react'
import ImageGallery from '../image-gallery'
import {
  Attachment,
  CollectionNames,
  FullAttachment,
  ViewNames,
} from '../../modules/attachments'
import NoResultsMessage from '../no-results-message'
import AttachmentCaption from '../attachment-caption'
import ErrorMessage from '../error-message'
import LoadingIndicator from '../loading-indicator'
import useDataStoreItems from '../../hooks/useDataStoreItems'

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
  // const needsToPopulateAttachments =
  //   ids.length > 0 &&
  //   ids.filter(
  //     (id) => attachmentsData.find((data) => data.id === id) !== undefined
  //   ).length > 0

  // const [isLoading, isError, newAttachmentsData] =
  //   useDataStoreItems<FullAttachment>(
  //     ViewNames.GetFullAttachments,
  //     needsToPopulateAttachments ? ids : false
  //   )

  if (!ids.length) {
    return <NoResultsMessage>No attachments found</NoResultsMessage>
  }

  // if (needsToPopulateAttachments && (isLoading || !newAttachmentsData)) {
  //   return <LoadingIndicator message="Loading attachments for output..." />
  // }

  // if (isError) {
  //   return <ErrorMessage>Failed to load attachments</ErrorMessage>
  // }

  // const attachmentsDataToUse = newAttachmentsData || attachmentsData

  return (
    <ImageGallery
      // @ts-ignore
      images={ids
        .map((id) => {
          const attachment = attachmentsData.find((data) => data.id === id)

          if (!attachment) {
            return {
              url: '/#failed',
              caption: (
                <ErrorMessage>Could not find attachment for {id}</ErrorMessage>
              ),
            }
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
