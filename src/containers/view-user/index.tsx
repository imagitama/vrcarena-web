import React from 'react'
import { useParams } from 'react-router'
import { Helmet } from '@unhead/react/helmet'

import { BanStatus, FullUser, ViewNames } from '@/modules/users'

import useDataStoreItem from '@/hooks/useDataStoreItem'
import useIsEditor from '@/hooks/useIsEditor'

import UserOverview from '@/components/user-overview'
import LoadingIndicator from '@/components/loading-indicator'
import ErrorMessage from '@/components/error-message'

export default () => {
  const { userId } = useParams<{ userId: string }>()
  const isEditor = useIsEditor()
  const [isLoadingUser, lastErrorCodeLoadingUser, user] =
    useDataStoreItem<FullUser>(
      isEditor ? ViewNames.GetFullUsers_Editor : ViewNames.GetFullUsers,
      userId,
      {
        queryName: 'user-overview',
      }
    )

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

  if (user.banstatus === BanStatus.Banned && !isEditor)
    return <ErrorMessage>User is banned.</ErrorMessage>

  return (
    <>
      <Helmet>
        <title>View {user.username}'s profile</title>
        <meta
          name="description"
          content={`View the user profile of ${user.username}.`}
        />
      </Helmet>
      {user.banstatus === BanStatus.Banned && isEditor && (
        <ErrorMessage>
          User is banned. You can view their profile because you are a staff
          member.
        </ErrorMessage>
      )}
      <UserOverview user={user} />
    </>
  )
}
