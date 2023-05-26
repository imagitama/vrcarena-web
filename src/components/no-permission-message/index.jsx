import React from 'react'
import ErrorMessage from '../error-message'

export default ({ message = undefined }) => (
  <ErrorMessage showHint={false}>
    You do not have permission to access this area
    {message && (
      <>
        <br />
        <br />
        {message}
      </>
    )}
  </ErrorMessage>
)
