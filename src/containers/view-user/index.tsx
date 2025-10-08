import React from 'react'
import { useParams } from 'react-router'
import { Helmet } from 'react-helmet'

import UserOverview from '../../components/user-overview'
import useDataStoreItem from '../../hooks/useDataStoreItem'
import { FullUser, ViewNames } from '../../modules/users'
import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'

export default () => {
  const { userId } = useParams<{ userId: string }>()
  const [isLoadingUser, lastErrorCodeLoadingUser, user] =
    useDataStoreItem<FullUser>(ViewNames.GetFullUsers, userId, {
      queryName: 'user-overview',
    })

  if (isLoadingUser) {
    return <LoadingIndicator message="Loading user profile..." />
  }

  if (lastErrorCodeLoadingUser !== null) {
    return (
      <ErrorMessage>
        Failed to the user (code {lastErrorCodeLoadingUser})
      </ErrorMessage>
    )
  }

  if (!user) {
    return <ErrorMessage>Failed to load the user (invalid user)</ErrorMessage>
  }

  return (
    <>
      <Helmet>
        <title>View {user.username}'s profile | VRCArena</title>
        <meta
          name="description"
          content={`View the user profile of ${user.username}.`}
        />
      </Helmet>
      <UserOverview user={user} />
    </>
  )
}
