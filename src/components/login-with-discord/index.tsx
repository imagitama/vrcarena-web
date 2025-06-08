import React, { useEffect, useState } from 'react'
import firebase from 'firebase'

import useHistory from '../../hooks/useHistory'
import { callFunction } from '../../firebase'
import { handleError } from '../../error-handling'
import * as routes from '../../routes'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import Button from '../button'
import SyncUserWithDiscordForm from '../sync-user-with-discord-form'
import { DiscordUser } from '../../discord'

// when you log in this component gets completely remounted so it tries to repeat a bunch of times
let isAlreadyAuthenticated = false

// TODO: Use enum
const errorCodes = {
  BAD_ACCESS_CODE: 100,
  UNKNOWN: 999
}

// TODO: Verify if actually used
interface LoginWithDiscordError {
  errorCode: number
}

export default ({ code, onSuccess, onFail }: {
  code: string
  onSuccess: () => void
  onFail: () => void
}) => {
  const [errorCode, setErrorCode] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [lastKnownDiscordUser, setLastKnownDiscordUser] = useState<DiscordUser | null>(null)
  const { push } = useHistory()

  useEffect(() => {
    if (!code || isAlreadyAuthenticated) {
      return
    }

    async function main() {
      try {
        setErrorCode(null)
        setIsLoading(true)
        setIsSuccess(false)

        const {
          data: { token, discordUser, hasAlreadySignedUp, errorCode }
        } = await callFunction<{ code: string }, {
          token: string
          discordUser: DiscordUser
          hasAlreadySignedUp: boolean
          errorCode?: number
        }>('loginWithDiscord', {
          code
        })

        if (errorCode !== undefined) {
          setErrorCode(errorCode)
          setIsLoading(false)
          setIsSuccess(false)
          return
        }

        const {
          user: loggedInUser
        } = await firebase.auth().signInWithCustomToken(token)

        // the user might not have an email OR the email might already be taken so just ignore errors
        // TODO: Check against existing emails?
        try {
          await loggedInUser!.updateEmail(discordUser.email)
        } catch (err) {
          console.error(err)
        }

        isAlreadyAuthenticated = true

        if (hasAlreadySignedUp) {
          console.debug(
            `User has already signed up, redirecting to homepage...`
          )
          push(routes.home)
          return
        }

        setLastKnownDiscordUser(discordUser)
        setErrorCode(null)
        setIsLoading(false)
        setIsSuccess(true)
      } catch (err) {
        console.error(err)
        handleError(err)
        setErrorCode((err as LoginWithDiscordError).errorCode || errorCodes.UNKNOWN)
        setIsLoading(false)
      }
    }

    main()
  }, [code])

  if (errorCode) {
    return (
      <ErrorMessage>
        Failed to get your details from Discord:
        <br />
        <br />
        Error: {errorCode || 'Internal server error'}
        <br />
        <br />
        <Button onClick={() => onFail()}>Try Again</Button>
      </ErrorMessage>
    )
  }

  if (isLoading) {
    return <LoadingIndicator message="Loading your Discord details..." />
  }

  if (isSuccess && lastKnownDiscordUser) {
    return (
      <SyncUserWithDiscordForm
        discordUser={lastKnownDiscordUser}
        onDone={onSuccess}
      />
    )
  }

  // useSetupProfileRedirect() hook in App should kick in and redirect us...
  return (
    <LoadingIndicator message="You have logged in successfully, redirecting..." />
  )
}
