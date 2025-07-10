import React, { useRef, useState } from 'react'
import SyncIcon from '@mui/icons-material/Sync'

import useDataStoreEdit from '../../hooks/useDataStoreEdit'
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
import { DiscordUser } from '../../discord'

interface SyncUserWithDiscordPayload {
  userId: string
}

interface SyncUserWithDiscordResult {
  username: string
  ourAvatarUrl: string | null
}

enum FunctionName {
  SyncUserWithDiscord = 'syncUserWithDiscord',
}

enum ErrorCode {
  Unknown = 999,
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
  const [lastSyncErrorCode, setLastSyncErrorCode] = useState<ErrorCode | null>(
    null
  )
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, isSuccess, lastSaveErrorCode, save, clear] =
    useDataStoreEdit<User>(CollectionNames.Users, userId!)
  const avatarUrlRef = useRef<string | null>(null)

  const performSync = async (onlyWithAvatar: boolean = false) => {
    try {
      setLastSyncErrorCode(null)
      setIsLoading(true)

      if (!onlyWithAvatar) {
        const {
          data: { username, ourAvatarUrl },
        } = await callFunction<
          SyncUserWithDiscordPayload,
          SyncUserWithDiscordResult
        >(FunctionName.SyncUserWithDiscord, {
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

      setLastSyncErrorCode(null)
      setIsLoading(false)

      hydrateUser()

      if (onDone) {
        onDone()
      }
    } catch (err) {
      setLastSyncErrorCode(ErrorCode.Unknown) // TODO: Finish
      setIsLoading(false)
      console.error(err)
      handleError(err)
    }
  }

  const retryOnlyWithAvatar = () => performSync(true)

  if (lastSyncErrorCode !== null) {
    return (
      <ErrorMessage onOkay={onDone}>
        Failed to sync with Discord (code {lastSyncErrorCode}). Are you sure you
        have signed in with Discord before?
      </ErrorMessage>
    )
  }

  if (isLoading) {
    return <LoadingIndicator message="Getting your Discord profile..." />
  }

  if (isSaving) {
    return <LoadingIndicator message="Saving your account..." />
  }

  if (lastSaveErrorCode !== null) {
    if (lastSaveErrorCode === DataStoreErrorCode.ViolateUniqueConstraint) {
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
        Failed to save your account: {lastSaveErrorCode}
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
