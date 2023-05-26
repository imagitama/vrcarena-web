import React from 'react'
import ErrorMessage from '../error-message'
import { DISCORD_URL, EMAIL } from '../../config'
import Button from '../button'

export default props => (
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
