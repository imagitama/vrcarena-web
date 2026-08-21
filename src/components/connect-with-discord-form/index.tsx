import React, { useEffect, useState } from 'react'
import { makeStyles } from '@mui/styles'
import { useHistory } from 'react-router'

import { callFunction } from '@/firebase'
import { handleError } from '@/error-handling'
import { connectWithDiscordUrl } from '@/config'
import { DiscordUser, FunctionNames } from '@/discord'
import { OpenExternalLink as OpenExternalLinkIcon } from '@/icons'

import useQueryParam from '@/hooks/useQueryParam'

import LoadingIndicator from '@/components/loading-indicator'
import ErrorMessage from '@/components/error-message'
import Button from '@/components/button'
import HintText from '@/components/hint-text'
import SuccessMessage from '../success-message'
import FormControls from '../form-controls'
import WarningMessage from '../warning-message'

const useStyles = makeStyles({
  button: {
    backgroundColor: '#7289da !important',
    '&:hover': {
      backgroundColor: '#445282 !important',
    },
  },
})

enum ErrorCode {
  Unknown,
  BadCode,
  AlreadyConnected,
}

const getErrorCodeFromError = (err: Error): ErrorCode => {
  if (err instanceof ConnectWithDiscordError) {
    switch (err.errorCode) {
      case ConnectWithDiscordErrorCode.BadCode:
        return ErrorCode.BadCode
      case ConnectWithDiscordErrorCode.AlreadyConnected:
        return ErrorCode.AlreadyConnected
      default:
        return ErrorCode.Unknown
    }
  }
  return ErrorCode.Unknown
}

enum ConnectWithDiscordErrorCode {
  Unknown = 'Unknown',
  BadCode = 'BadCode',
  AlreadyConnected = 'AlreadyConnected',
}

interface ConnectWithDiscordPayload {
  code: string
}

interface ConnectWithDiscordSuccessResponse {
  discordUser: DiscordUser
}

interface ConnectWithDiscordFailedResponse {
  errorCode: ConnectWithDiscordErrorCode
}

type ConnectWithDiscordResponse =
  | ConnectWithDiscordSuccessResponse
  | ConnectWithDiscordFailedResponse

class ConnectWithDiscordError extends Error {
  errorCode: ConnectWithDiscordErrorCode
  constructor(errorCode: ConnectWithDiscordErrorCode) {
    super()
    this.errorCode = errorCode
  }
}

const ConnectWithDiscordForm = ({ onDone }: { onDone: () => void }) => {
  const code = useQueryParam('code')
  const [lastErrorCode, setLastErrorCode] = useState<ErrorCode | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [lastKnownDiscordUser, setLastKnownDiscordUser] =
    useState<DiscordUser | null>(null)
  const classes = useStyles()
  const { push } = useHistory()

  const onRetry = () => {
    const params = new URLSearchParams(location.search)
    params.delete('code')
    push(
      { pathname: location.pathname, search: params.toString() },
      { replace: true }
    )
    setLastErrorCode(null)
    setIsLoading(false)
    setIsSuccess(false)
    setLastKnownDiscordUser(null)
  }

  useEffect(() => {
    if (!code) {
      return
    }

    ;(async () => {
      try {
        setLastErrorCode(null)
        setIsLoading(true)
        setIsSuccess(false)

        const { data } = await callFunction<
          ConnectWithDiscordPayload,
          ConnectWithDiscordResponse
        >(FunctionNames.ConnectWithDiscord, {
          code,
        })

        if (
          (data as ConnectWithDiscordFailedResponse).errorCode !== undefined
        ) {
          throw new ConnectWithDiscordError(
            (data as ConnectWithDiscordFailedResponse).errorCode
          )
        }

        setLastKnownDiscordUser(
          (data as ConnectWithDiscordSuccessResponse).discordUser
        )
        setLastErrorCode(null)
        setIsLoading(false)
        setIsSuccess(true)
      } catch (err) {
        console.error(err)
        handleError(err)
        setLastErrorCode(getErrorCodeFromError(err as Error))
        setIsLoading(false)
      }
    })()
  }, [code])

  if (lastErrorCode !== null) {
    switch (lastErrorCode) {
      case ErrorCode.BadCode:
        return (
          <WarningMessage>
            The code that Discord gave you looks invalid or expired. Please try
            again to get a new code.
            <FormControls>
              <Button onClick={onRetry}>Retry</Button>
            </FormControls>
          </WarningMessage>
        )
      case ErrorCode.AlreadyConnected:
        return (
          <ErrorMessage>
            Someone has already connected their VRCArena account with that
            Discord account. Only one account can be linked together.
          </ErrorMessage>
        )
      default:
        return (
          <ErrorMessage
            errorCode={lastErrorCode as unknown as string}
            onRetry={onDone}>
            Failed to get your details from Discord
          </ErrorMessage>
        )
    }
  }

  if (isLoading) {
    return <LoadingIndicator message="Loading your Discord details..." />
  }

  if (isSuccess) {
    return (
      <SuccessMessage onOkay={onDone}>
        You connected your VRCArena account with Discord successfully 😎
      </SuccessMessage>
    )
  }

  return (
    <FormControls>
      <div>
        <Button
          size="large"
          icon={<OpenExternalLinkIcon />}
          className={classes.button}
          url={connectWithDiscordUrl}>
          Connect with Discord
        </Button>
        <br />
        <HintText>Opens Discord in a new tab</HintText>
      </div>
    </FormControls>
  )
}

export default ConnectWithDiscordForm
