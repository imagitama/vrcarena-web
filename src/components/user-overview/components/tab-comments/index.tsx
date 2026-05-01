import React from 'react'

import useIsLoggedIn from '@/hooks/useIsLoggedIn'
import { getUserIsStaffMember } from '@/utils/users'

import CommentList from '@/components/comment-list'
import Heading from '@/components/heading'
import { CollectionNames } from '@/modules/user'
import WarningMessage from '@/components/warning-message'

import useUserOverview from '../../useUserOverview'

export default () => {
  const { userId, user } = useUserOverview()
  const isLoggedIn = useIsLoggedIn()

  if (!userId || !user) {
    return null
  }

  return (
    <>
      <Heading variant="h2">Comments</Heading>
      {getUserIsStaffMember(user) && isLoggedIn && (
        <WarningMessage>
          Please do not comment here asking staff for support questions. Please
          open a support ticket in our Discord server.
        </WarningMessage>
      )}
      <CommentList collectionName={CollectionNames.Users} parentId={userId} />
    </>
  )
}
