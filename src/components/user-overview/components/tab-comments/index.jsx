import React from 'react'
import { CollectionNames } from '../../../../hooks/useDatabaseQuery'
import CommentList from '../../../comment-list'
import useUserOverview from '../../useUserOverview'

export default () => {
  const { userId, user } = useUserOverview()

  if (!userId || !user) {
    return null
  }

  return (
    <>
      <CommentList collectionName={CollectionNames.Users} parentId={userId} />
    </>
  )
}
