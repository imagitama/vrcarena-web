import React, { useEffect, useState } from 'react'
import { makeStyles } from '@mui/styles'

import useHistory from '@/hooks/useHistory'
import { auth, callFunction } from '@/firebase'
import { handleError } from '@/error-handling'
import * as routes from '@/routes'
import { loginWithDiscordUrl } from '@/config'
import { DiscordUser, FunctionNames } from '@/discord'
import { signInWithCustomToken, updateEmail } from 'firebase/auth'

import LoadingIndicator from '@/components/loading-indicator'
import ErrorMessage from '@/components/error-message'
import SyncUserWithDiscordForm from '@/components/sync-user-with-discord-form'
import Button from '@/components/button'
import { OpenExternalLink as OpenExternalLinkIcon } from '@/icons'
import HintText from '@/components/hint-text'

const useStyles = makeStyles({
  button: {
    backgroundColor: '#7289da !important',
    '&:hover': {
      backgroundColor: '#445282 !important',
    },
  },
})

// when you log in this component gets completely remounted so it tries to repeat a bunch of times
let isAlreadyAuthenticated = false

enum ErrorCode {
  Unknown,
  BadCode,
}

const getErrorCodeFromError = (err: Error): ErrorCode => {
  if (err instanceof LoginWithDiscordError) {
    switch (err.errorCode) {
      case LoginWithDiscordErrorCode.BadCode:
        return ErrorCode.BadCode
      default:
        return ErrorCode.Unknown
    }
  }
  return ErrorCode.Unknown
}

enum LoginWithDiscordErrorCode {
  Unknown = 'Unknown',
  BadCode = 'BadCode',
}

interface LoginWithDiscordPayload {
  code: string
}

interface LoginWithDiscordSuccessResponse {
  token: string
  discordUser: DiscordUser
  hasAlreadySignedUp: boolean
}

interface LoginWithDiscordFailedResponse {
  errorCode: LoginWithDiscordErrorCode
}

type LoginWithDiscordResponse =
  | LoginWithDiscordSuccessResponse
  | LoginWithDiscordFailedResponse

class LoginWithDiscordError extends Error {
  errorCode: LoginWithDiscordErrorCode
  constructor(errorCode: LoginWithDiscordErrorCode) {
    super()
    this.errorCode = errorCode
  }
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
  const classes = useStyles()

  useEffect(() => {
    if (!code || isAlreadyAuthenticated) {
      return
    }

    async function main() {
      try {
        setLastErrorCode(null)
        setIsLoading(true)
        setIsSuccess(false)

        const { data } = await callFunction<
          LoginWithDiscordPayload,
          LoginWithDiscordResponse
        >(FunctionNames.LoginWithDiscord, {
          code,
        })

        if ((data as LoginWithDiscordFailedResponse).errorCode !== undefined) {
          throw new LoginWithDiscordError(
            (data as LoginWithDiscordFailedResponse).errorCode
          )
        }

        const { token, discordUser, hasAlreadySignedUp } =
          data as LoginWithDiscordSuccessResponse

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
        setLastErrorCode(getErrorCodeFromError(err as Error))
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

  if (isSuccess) {
    if (lastKnownDiscordUser) {
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

  return (
    <div>
      <Button
        size="large"
        icon={<OpenExternalLinkIcon />}
        className={classes.button}
        url={loginWithDiscordUrl}>
        Login with Discord
      </Button>
      <br />
      <HintText>Opens Discord in a new tab</HintText>
    </div>
  )
}
