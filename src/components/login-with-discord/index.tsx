import React, { useEffect, useState } from 'react'
import { makeStyles } from '@mui/styles'

import useHistory from '@/hooks/useHistory'
import { client } from '@/supabase'
import { handleError } from '@/error-handling'
import { DiscordUser } from '@/discord'

import LoadingIndicator from '@/components/loading-indicator'
import ErrorMessage from '@/components/error-message'
import Button from '@/components/button'
import { OpenExternalLink as OpenExternalLinkIcon } from '@/icons'
import HintText from '@/components/hint-text'
import useTimer from '@/hooks/useTimer'

const useStyles = makeStyles({
  button: {
    backgroundColor: '#7289da !important',
    '&:hover': {
      backgroundColor: '#445282 !important',
    },
  },
})

enum ErrorCode {
  Unknown = 'unknown',
}

const getErrorCodeFromError = (err: Error): ErrorCode => ErrorCode.Unknown

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
  const onSuccessTimer = useTimer(onSuccess)

  const onClickLogin = async () => {
    try {
      setLastErrorCode(null)
      setIsLoading(true)
      setIsSuccess(false)

      // enable locally http://127.0.0.1:54323
      await client.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: process.env.REACT_APP_DISCORD_LOGIN_REDIRECT_BASE_URI, // not full URL
          scopes: 'identify email',
        },
      })

      // user is redirected to Discord then back to /
      // where Supabase auth should take over (so no onSuccess)
    } catch (err) {
      console.error(err)
      handleError(err)
      setLastErrorCode(getErrorCodeFromError(err as Error))
      setIsLoading(false)
    }
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage errorCode={lastErrorCode}>
        Failed to login with Discord
      </ErrorMessage>
    )
  }

  if (isLoading) {
    return <LoadingIndicator message="Loading your Discord details..." />
  }

  if (isSuccess) {
    // if (lastKnownDiscordUser) {
    //   return (
    //     <SyncUserWithDiscordForm
    //       discordUser={lastKnownDiscordUser}
    //       onDone={onSuccess}
    //     />
    //   )
    // }

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
        onClick={onClickLogin}>
        Login with Discord
      </Button>
      <br />
      <HintText>Opens Discord in a new tab</HintText>
    </div>
  )
}
