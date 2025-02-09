import React, { useRef, useState } from 'react'
import SyncIcon from '@material-ui/icons/Sync'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import { callFunction } from '../../firebase'
import { handleError } from '../../error-handling'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import Button from '../button'
import useUserId from '../../hooks/useUserId'
import useUserRecord from '../../hooks/useUserRecord'
import { User } from '../../modules/users'
import InfoMessage from '../info-message'
import FormControls from '../form-controls'
import { CollectionNames } from '../../modules/user'
import { DataStoreErrorCode } from '../../data-store'

interface DiscordUser {
  id: string
  avatar: string
}

interface SyncUserWithDiscordPayload {
  userId: string
}

interface SyncUserWithDiscordResult {
  username: string
  ourAvatarUrl: string | null
}

const SyncUserWithDiscordForm = ({
  discordUser,
  onDone,
}: {
  discordUser?: DiscordUser
  onDone?: () => void
}) => {
  const userId = useUserId()
  const [, , , hydrateUser] = useUserRecord()
  const [isError, setIsError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, isSuccess, lastErrorCode, save, clear] =
    useDatabaseSave<User>(CollectionNames.Users, userId)
  const avatarUrlRef = useRef<string | null>(null)

  const performSync = async (onlyWithAvatar: boolean = false) => {
    try {
      setIsError(false)
      setIsLoading(true)

      if (!onlyWithAvatar) {
        const {
          data: { username, ourAvatarUrl },
        } = await callFunction<
          SyncUserWithDiscordPayload,
          SyncUserWithDiscordResult
        >('syncUserWithDiscord', {
          userId: userId!,
        })

        avatarUrlRef.current = ourAvatarUrl

        // note: on username taken it will set error code
        await save({
          username,
          avatarurl: ourAvatarUrl || undefined,
        })
      } else {
        if (!avatarUrlRef.current) {
          throw new Error('Cannot continue without an avatar url')
        }

        await save({
          avatarurl: avatarUrlRef.current,
        })
      }

      setIsError(false)
      setIsLoading(false)

      hydrateUser()

      if (onDone) {
        onDone()
      }
    } catch (err) {
      setIsError(true)
      setIsLoading(false)
      console.error(err)
      handleError(err)
    }
  }

  const retryOnlyWithAvatar = () => performSync(true)

  if (isError) {
    return (
      <ErrorMessage onOkay={onDone}>
        Failed to sync with Discord. Are you sure you have signed in with
        Discord before?
      </ErrorMessage>
    )
  }

  if (isLoading) {
    return <LoadingIndicator message="Getting your Discord profile..." />
  }

  if (isSaving) {
    return <LoadingIndicator message="Saving your account..." />
  }

  if (lastErrorCode !== null) {
    if (lastErrorCode === DataStoreErrorCode.ViolateUniqueConstraint) {
      return (
        <ErrorMessage>
          Username is taken
          <br />
          <br />
          <Button onClick={retryOnlyWithAvatar}>Only Use Avatar Image</Button>
          <br />
        </ErrorMessage>
      )
    }

    return (
      <ErrorMessage onOkay={clear}>
        Failed to save your account: {lastErrorCode}
      </ErrorMessage>
    )
  }

  return (
    <>
      <InfoMessage>
        Click the button below to sync your account's username and avatar with
        your Discord account.
      </InfoMessage>
      <FormControls>
        <Button size="large" icon={<SyncIcon />} onClick={() => performSync()}>
          Sync Now
        </Button>
      </FormControls>
    </>
  )
}

export default SyncUserWithDiscordForm
