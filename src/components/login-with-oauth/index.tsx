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
import { ProviderId } from '@/auth'
import { Provider } from '@supabase/supabase-js'
import { capitalize } from '@/utils'

const useStyles = makeStyles({
  [ProviderId.Discord]: {
    backgroundColor: '#7289da !important',
    '&:hover': {
      backgroundColor: '#445282 !important',
    },
  },
  [ProviderId.Google]: {
    backgroundColor: '#4285f4 !important',
    '&:hover': {
      backgroundColor: '#2f6bd6 !important',
    },
  },
  [ProviderId.Twitter]: {
    backgroundColor: '#1da1f2 !important',
    '&:hover': {
      backgroundColor: '#0c85d0 !important',
    },
  },
  [ProviderId.Email]: {},
})

enum ErrorCode {
  Unknown = 'unknown',
}

const getErrorCodeFromError = (err: Error): ErrorCode => ErrorCode.Unknown

const LoginWithOAuth = ({
  provider,
  onSuccess,
  onFail,
}: {
  provider: ProviderId
  onSuccess: () => void
  onFail: () => void
}) => {
  const [lastErrorCode, setLastErrorCode] = useState<ErrorCode | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const classes = useStyles()

  const onClickLogin = async () => {
    try {
      setLastErrorCode(null)
      setIsLoading(true)
      setIsSuccess(false)

      // enable locally http://127.0.0.1:54323
      await client.auth.signInWithOAuth({
        provider: provider as Provider,
        options: {
          redirectTo: process.env.REACT_APP_OAUTH_REDIRECT_BASE_URI, // not full URL
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
      <ErrorMessage errorCode={lastErrorCode}>Failed to login</ErrorMessage>
    )
  }

  if (isLoading) {
    return <LoadingIndicator message="Loading your details..." />
  }

  if (isSuccess) {
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
        className={classes[provider]}
        onClick={onClickLogin}>
        Login with {capitalize(provider)}
      </Button>
      <br />
      <HintText>Opens in a new tab</HintText>
    </div>
  )
}

export default LoginWithOAuth
