import React from 'react'
import ErrorMessage, { ErrorMessageProps } from '@/components/error-message'
import { DISCORD_URL, EMAIL } from '@/config'
import { base64EncodeString } from '@/utils'

const ErrorBoundaryMessage = (
  props: { error: Error } & Omit<ErrorMessageProps, 'children'>
) => (
  <ErrorMessage
    hintText={
      <>
        This doesn't usually happen. Please{' '}
        <a href={DISCORD_URL}>join our Discord</a> or{' '}
        <a href={`mailto:${EMAIL}`}>email us</a> to report this error so I can
        fix it.
        <br />
        <br />
        Error:{' '}
        {props.error && props.error.message
          ? base64EncodeString(props.error.message)
          : '(no error)'}
      </>
    }
    {...props}>
    Something really screwed up (which doesn't happen often).
  </ErrorMessage>
)

export default ErrorBoundaryMessage
