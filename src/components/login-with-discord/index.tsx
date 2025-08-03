import React, { useEffect, useState } from 'react'

import useHistory from '../../hooks/useHistory'
import { auth, callFunction } from '../../firebase'
import { handleError } from '../../error-handling'
import * as routes from '../../routes'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import SyncUserWithDiscordForm from '../sync-user-with-discord-form'
import { DiscordUser } from '../../discord'
import { signInWithCustomToken, updateEmail } from 'firebase/auth'

// when you log in this component gets completely remounted so it tries to repeat a bunch of times
let isAlreadyAuthenticated = false

// TODO: Change backend to return strings for easier debugging
enum BackendErrorCode {
  BadAccessCode = 100,
  Unknown = 999,
}

enum ErrorCode {
  BadAccessCode,
  FailedToUpdateEmail,
  Unknown,
}

const mapBackendErrorCode = (backendErrorCode: BackendErrorCode): ErrorCode => {
  switch (backendErrorCode) {
    case BackendErrorCode.BadAccessCode:
      return ErrorCode.BadAccessCode
    default:
      return ErrorCode.Unknown
  }
}

// TODO: Verify if actually used
interface LoginWithDiscordError {
  errorCode: BackendErrorCode
}

enum FunctionNames {
  LoginWithDiscord = 'loginWithDiscord',
}

export default ({
  code,
  onSuccess,
  onFail,
}: {
  code: string
  onSuccess: () => void
  onFail: () => void
}) => {
  const [lastErrorCode, setLastErrorCode] = useState<ErrorCode | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [lastKnownDiscordUser, setLastKnownDiscordUser] =
    useState<DiscordUser | null>(null)
  const { push } = useHistory()

  useEffect(() => {
    if (!code || isAlreadyAuthenticated) {
      return
    }

    async function main() {
      try {
        setLastErrorCode(null)
        setIsLoading(true)
        setIsSuccess(false)

        const {
          data: { token, discordUser, hasAlreadySignedUp, errorCode },
        } = await callFunction<
          { code: string },
          {
            token: string
            discordUser: DiscordUser
            hasAlreadySignedUp: boolean
            errorCode?: BackendErrorCode
          }
        >(FunctionNames.LoginWithDiscord, {
          code,
        })

        if (errorCode !== undefined) {
          setLastErrorCode(mapBackendErrorCode(errorCode))
          setIsLoading(false)
          setIsSuccess(false)
          return
        }

        const { user: loggedInUser } = await signInWithCustomToken(auth, token)

        // NOTE: the user might not have an email OR the email might already be taken so just ignore errors
        try {
          await updateEmail(loggedInUser, discordUser.email)
        } catch (err) {
          console.error(err)

          // NOTE: We may want to fix this issue but shouldn't block them logging in
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
        setLastErrorCode(null)
        setIsLoading(false)
        setIsSuccess(true)
      } catch (err) {
        console.error(err)
        handleError(err)
        setLastErrorCode(
          (err as LoginWithDiscordError).errorCode
            ? mapBackendErrorCode((err as LoginWithDiscordError).errorCode)
            : ErrorCode.Unknown
        )
        setIsLoading(false)
      }
    }

    main()
  }, [code])

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage onRetry={onFail}>
        Failed to get your details from Discord (code {lastErrorCode})
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
