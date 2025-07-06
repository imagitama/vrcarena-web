import React from 'react'
import CommentList from '../../../comment-list'
import Heading from '../../../heading'
import useUserOverview from '../../useUserOverview'
import { CollectionNames } from '../../../../modules/user'

export default () => {
  const { userId, user } = useUserOverview()

  if (!userId || !user) {
    return null
  }

  return (
    <>
      <Heading variant="h2">Comments</Heading>
      <CommentList collectionName={CollectionNames.Users} parentId={userId} />
    </>
  )
}
