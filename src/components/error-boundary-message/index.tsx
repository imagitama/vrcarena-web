import React from 'react'
import ErrorMessage, { ErrorMessageProps } from '../error-message'
import { DISCORD_URL, EMAIL } from '../../config'

export default (props: Omit<ErrorMessageProps, 'children'>) => (
  <ErrorMessage
    hintText={
      <>
        This doesn't usually happen. Please{' '}
        <a href={DISCORD_URL}>join our Discord</a> or{' '}
        <a href={`mailto:${EMAIL}`}>email us</a> to report this error so we can
        fix it.
      </>
    }
    {...props}>
    Whoops. Something went wrong.
  </ErrorMessage>
)
