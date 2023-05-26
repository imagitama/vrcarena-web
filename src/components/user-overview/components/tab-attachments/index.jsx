import React from 'react'
import Attachments from '../../../attachments'
import useUserOverview from '../../useUserOverview'

const AttachmentsForUser = ({ userId }) => {
  return <Attachments createdBy={userId} includeParents />
}

export default () => {
  const { userId, user } = useUserOverview()

  if (!userId || !user) {
    return null
  }

  return <AttachmentsForUser userId={userId} />
}
