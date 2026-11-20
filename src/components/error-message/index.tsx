import React from 'react'
import ErrorIcon from '@mui/icons-material/Error'
import ReplayIcon from '@mui/icons-material/Replay'
import CheckIcon from '@mui/icons-material/Check'

import { DISCORD_URL, EMAIL } from '@/config'
import { base64EncodeString, capitalize } from '@/utils'
import Message, { MessageProps } from '@/components/message'
import Button from '@/components/button'
import { getUserFriendlyMessageFromCode } from '@/data-store'
import HintText from '../hint-text'

const getErrorCodeForError = (error: Error): string =>
  base64EncodeString(error.message)

export interface ErrorMessageProps extends MessageProps {
  children: React.ReactNode
  error?: Error
  hintText?: false | string | React.ReactElement
  onRetry?: () => void
  onOkay?: () => void
  errorCode?: string
}

const ErrorMessage = ({
  title,
  children,
  error,
  hintText,
  onRetry,
  onOkay,
  errorCode,
  ...messageProps
}: ErrorMessageProps) => (
  <Message
    icon={<ErrorIcon />}
    color="#1c0002"
    title={title || children}
    controls={
      onRetry || onOkay ? (
        <>
          {onRetry ? (
            <Button onClick={onRetry} icon={<ReplayIcon />} color="secondary">
              Retry
            </Button>
          ) : null}{' '}
          {onOkay ? (
            <Button onClick={onOkay} icon={<CheckIcon />} color="secondary">
              Okay
            </Button>
          ) : null}
        </>
      ) : messageProps.controls ? (
        messageProps.controls
      ) : undefined
    }
    {...messageProps}>
    {title && children ? children : null}
    {errorCode !== undefined ? (
      <div>
        {capitalize(getUserFriendlyMessageFromCode(errorCode) || '')} (code{' '}
        {errorCode})
        <br />
        <br />
      </div>
    ) : null}
    {hintText || hintText === undefined ? (
      <div>
        <br />
        {hintText || (
          <HintText>
            If you believe this is wrong or unexpected please{' '}
            <a href={DISCORD_URL}>join our Discord</a> or{' '}
            <a href={`mailto:${EMAIL}`}>email us</a> to report it so we can fix
            it.
          </HintText>
        )}
      </div>
    ) : null}
    {error ? (
      <>
        <br />
        <br />
        <strong>Please copy and paste this error code: </strong>{' '}
        <code style={{ wordWrap: 'break-word' }}>
          {getErrorCodeForError(error)}
        </code>
      </>
    ) : null}
  </Message>
)

export default ErrorMessage
