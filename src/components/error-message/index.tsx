import React from 'react'
import ErrorIcon from '@material-ui/icons/Error'
import ReplayIcon from '@material-ui/icons/Replay'
import CheckIcon from '@material-ui/icons/Check'

import { DISCORD_URL, EMAIL } from '../../config'
import { base64EncodeString } from '../../utils'
import Message from '../message'
import FormControls from '../form-controls'
import Button from '../button'

const getErrorCodeForError = (error: Error): string =>
  base64EncodeString(error.message)

export default ({
  children,
  error,
  hintText,
  onRetry,
  onOkay
}: {
  children: React.ReactNode
  error?: Error
  hintText?: false | string
  onRetry?: () => void
  onOkay?: () => void
}) => (
  <Message icon={<ErrorIcon />} color="#1c0002">
    <strong>{children}</strong>
    {hintText || hintText === undefined ? (
      <>
        <br />
        <br />
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
        <strong>Please give us this error code:</strong>{' '}
        {getErrorCodeForError(error)}
      </>
    ) : null}
    {onRetry || onOkay ? (
      <FormControls>
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
      </FormControls>
    ) : null}
  </Message>
)
