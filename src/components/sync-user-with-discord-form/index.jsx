import React, { useEffect, useState } from 'react'

import { UserFieldNames, CollectionNames } from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import { callFunction } from '../../firebase'
import { handleError } from '../../error-handling'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import Button from '../button'
import useUserId from '../../hooks/useUserId'
import useUserRecord from '../../hooks/useUserRecord'

export default ({ discordUser, onDone }) => {
  const userId = useUserId()
  const [, , , hydrateUser] = useUserRecord()
  const [isError, setIsError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [, , , save] = useDatabaseSave(CollectionNames.Users, userId)

  useEffect(() => {
    if (!userId || !discordUser) {
      return
    }

    async function main() {
      try {
        setIsError(false)
        setIsLoading(true)

        let optimizedImageUrl

        // if user has no avatar set
        if (discordUser.avatar) {
          const { data } = await callFunction(
            'downloadAndOptimizeDiscordAvatar',
            {
              discordUserId: discordUser.id,
              avatarHash: discordUser.avatar
            }
          )

          optimizedImageUrl = data.optimizedImageUrl
        }

        await save({
          [UserFieldNames.avatarUrl]: optimizedImageUrl || null
        })

        setIsError(false)
        setIsLoading(false)

        // update avatar
        hydrateUser()

        onDone()
      } catch (err) {
        setIsError(true)
        setIsLoading(false)
        console.error(err)
        handleError(err)
      }
    }

    main()
  }, [userId, discordUser !== null])

  if (isError) {
    return (
      <ErrorMessage>
        Failed to use your Discord profile for your profile! You have logged in
        but your username and avatar has not been set
        <br />
        <br />
        <Button onClick={() => onDone()}>OK</Button>
      </ErrorMessage>
    )
  }

  if (isLoading) {
    return (
      <LoadingIndicator message="Setting your avatar and username to your Discord profile..." />
    )
  }

  return null
}
