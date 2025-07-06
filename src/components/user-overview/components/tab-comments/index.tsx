import React from 'react'
import CommentList from '../../../comment-list'
import Heading from '../../../heading'
import useUserOverview from '../../useUserOverview'
import { CollectionNames } from '../../../../modules/user'
import WarningMessage from '../../../warning-message'
import { getUserIsStaffMember } from '../../../../utils/users'
import useIsLoggedIn from '../../../../hooks/useIsLoggedIn'

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
