import React from 'react'

import useDataStoreItem from '@/hooks/useDataStoreItem'
import useUserId from '@/hooks/useUserId'

import { CollectionNames } from '@/modules/users'
import { UserMeta } from '@/modules/users'

import ErrorMessage from '@/components/error-message'
import LoadingIndicator from '@/components/loading-indicator'
import NoResultsMessage from '@/components/no-results-message'
import SuccessMessage from '@/components/success-message'
import SyncUserWithDiscordForm from '@/components/sync-user-with-discord-form'
import ConnectWithDiscordForm from '@/components/connect-with-discord-form'

const Discord = () => {
  const userId = useUserId()
  const [isLoading, lastErrorCode, userMeta, hydrate] =
    useDataStoreItem<UserMeta>(CollectionNames.UsersMeta, userId!)

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>
        Failed to load Discord details (code {lastErrorCode})
      </ErrorMessage>
    )
  }

  if (isLoading || !userMeta) {
    return <LoadingIndicator message="Loading Discord details..." />
  }

  const discordUserId = userMeta.discorduserid

  if (!discordUserId) {
    return (
      <>
        <NoResultsMessage>
          You have not connected your account with Discord yet.
        </NoResultsMessage>
        <ConnectWithDiscordForm onDone={hydrate} />
      </>
    )
  }

  return (
    <>
      <SuccessMessage>
        Your VRCArena account has been connected with your Discord account 😎
      </SuccessMessage>
      <SyncUserWithDiscordForm />
    </>
  )
}

export default Discord
