import React from 'react'
import { FullAttachment } from '../../modules/attachments'
import ResultsItems from '../results-items'
import * as routes from '../../routes'

const AttachmentResults = ({
  attachments,
}: {
  attachments: FullAttachment[]
}) => (
  <ResultsItems<FullAttachment>
    items={attachments.map((attachment) => ({
      ...attachment,
      linkUrl: routes.viewAttachmentWithVar.replace(
        ':attachmentId',
        attachment.id
      ),
      thumbnailUrl: attachment.thumbnailurl,
      description: '', // do not render
    }))}
  />
)

export default AttachmentResults
