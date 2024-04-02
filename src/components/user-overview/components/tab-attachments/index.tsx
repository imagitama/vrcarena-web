import React from 'react'
import useUserOverview from '../../useUserOverview'
import AttachmentsByParent from '../../../attachments-by-parent'
import { AttachmentReason } from '../../../../modules/attachments'

const TabAttachments = () => {
  const { userId, user } = useUserOverview()

  if (!userId || !user) {
    return null
  }

  return (
    <AttachmentsByParent
      reason={AttachmentReason.UserAdded}
      createdBy={userId}
    />
  )
}

export default TabAttachments
