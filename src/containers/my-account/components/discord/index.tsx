import ErrorMessage from '../../../../components/error-message'
import LoadingIndicator from '../../../../components/loading-indicator'
import NoResultsMessage from '../../../../components/no-results-message'
import SuccessMessage from '../../../../components/success-message'
import SyncUserWithDiscordForm from '../../../../components/sync-user-with-discord-form'
import useDataStoreItem from '../../../../hooks/useDataStoreItem'
import useUserId from '../../../../hooks/useUserId'
import { CollectionNames } from '../../../../modules/user'
import { UserMeta } from '../../../../modules/users'

const Discord = () => {
  const userId = useUserId()
  const [isLoading, lastErrorCode, userMeta] = useDataStoreItem<UserMeta>(
    CollectionNames.UsersMeta,
    userId!
  )

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>
        Failed to load Discord details: {lastErrorCode}
      </ErrorMessage>
    )
  }

  if (isLoading || !userMeta) {
    return <LoadingIndicator message="Loading Discord details..." />
  }

  const discordUserId = userMeta.discorduserid

  if (!discordUserId) {
    return (
      <NoResultsMessage>
        No Discord details found for your account
      </NoResultsMessage>
    )
  }

  return (
    <>
      <SuccessMessage>Your Discord user ID: {discordUserId}</SuccessMessage>
      <SyncUserWithDiscordForm />
    </>
  )
}

export default Discord
