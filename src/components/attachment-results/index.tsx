import React from 'react'
import { Attachment, FullAttachment } from '../../modules/attachments'
import ResultsItems from '../results-items'
import * as routes from '../../routes'

const AttachmentResults = ({
  attachments,
}: {
  attachments: (FullAttachment | Attachment)[]
}) => (
  <ResultsItems<FullAttachment | Attachment>
    items={attachments.map((attachment) => ({
      ...attachment,
      linkUrl: routes.viewAttachmentWithVar.replace(
        ':attachmentId',
        attachment.id
      ),
      thumbnailUrl: attachment.thumbnailurl || attachment.url,
      description: '', // do not render
    }))}
  />
)

export default AttachmentResults
