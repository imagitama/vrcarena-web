import React from 'react'
import ErrorMessage from '../error-message'

export default ({ message = '' }: {
  message?: string
}) => (
  <ErrorMessage
    title="You do not have permission to access this area">
    {message}
  </ErrorMessage>
)
