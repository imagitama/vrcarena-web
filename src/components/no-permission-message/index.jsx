import React from 'react'
import ErrorMessage from '../error-message'

export default ({ message = '' }) => (
  <ErrorMessage
    showHint={false}
    title="You do not have permission to access this area">
    {message}
  </ErrorMessage>
)
