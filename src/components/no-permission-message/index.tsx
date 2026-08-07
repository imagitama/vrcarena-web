import React from 'react'
import ErrorMessage from '@/components/error-message'
import useIsLoggedIn from '@/hooks/useIsLoggedIn'
import Button from '../button'
import { routes } from '@/routes'

const NoPermissionMessage = ({ message = '' }: { message?: string }) => {
  const isLoggedIn = useIsLoggedIn()
  return (
    <ErrorMessage
      title="You do not have permission to access this area"
      controls={
        isLoggedIn ? undefined : (
          <Button
            url={routes.loginWithVar.replace(
              ':currentPath',
              encodeURIComponent(location.pathname + location.search)
            )}
            color="secondary">
            Go To Log In
          </Button>
        )
      }>
      {message}
    </ErrorMessage>
  )
}

export default NoPermissionMessage
