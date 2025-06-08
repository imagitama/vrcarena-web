import React from 'react'
import ErrorIcon from '@material-ui/icons/Error'
import ReplayIcon from '@material-ui/icons/Replay'
import CheckIcon from '@material-ui/icons/Check'

import { DISCORD_URL, EMAIL } from '../../config'
import { base64EncodeString } from '../../utils'
import Message, { MessageProps } from '../message'
import Button from '../button'

const getErrorCodeForError = (error: Error): string =>
  base64EncodeString(error.message)

  export interface ErrorMessageProps extends MessageProps {
    children: React.ReactNode
    error?: Error
    hintText?: false | string | React.ReactElement
    onRetry?: () => void
    onOkay?: () => void
  }

const ErrorMessage = ({
  title,
  children,
  error,
  hintText,
  onRetry,
  onOkay,
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
            <Button onClick={onRetry} icon={<ReplayIcon />}>
              Retry
            </Button>
          ) : null}{' '}
          {onOkay ? (
            <Button onClick={onOkay} icon={<CheckIcon />}>
              Okay
            </Button>
          ) : null}
        </>
      ) : undefined
    }>
    {title && children ? children : null}
    {hintText || hintText === undefined ? (
      <>
        {hintText || (
          <>
            If you believe this error is wrong or unexpected please{' '}
            <a href={DISCORD_URL}>join our Discord</a> or{' '}
            <a href={`mailto:${EMAIL}`}>email us</a> to report this error so we
            can fix it.
          </>
        )}
      </>
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
