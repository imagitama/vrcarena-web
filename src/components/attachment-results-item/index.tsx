import React from 'react'
import { FullAttachment } from '../../modules/attachments'
import ResultsItem from '../results-item'
import * as routes from '../../routes'

const AttachmentResultsItem = ({
  attachment,
}: {
  attachment: FullAttachment
}) => (
  <ResultsItem
    linkUrl={routes.viewAttachmentWithVar.replace(
      ':attachmentId',
      attachment.id
    )}
    title={attachment.title}
    thumbnailUrl={attachment.thumbnailurl}
    isadult={attachment.isadult || false}
    createdbyusername={attachment.createdbyusername}
    description={attachment.description}
  />
)

export default AttachmentResultsItem
