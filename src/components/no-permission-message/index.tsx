import React from 'react'
import ErrorMessage from '@/components/error-message'

const NoPermissionMessage = ({ message = '' }: { message?: string }) => (
  <ErrorMessage title="You do not have permission to access this area">
    {message}
  </ErrorMessage>
)

export default NoPermissionMessage
