import React from 'react'

import useQueryParam from '@/hooks/useQueryParam'

import ErrorMessage from '@/components/error-message'
import Heading from '@/components/heading'
import NotificationSettings from '@/components/notification-settings'

export default () => {
  const userId = useQueryParam('userId')
  const email = useQueryParam('email')

  if (!userId || !email) {
    return <ErrorMessage>Missing required data</ErrorMessage>
  }

  return (
    <>
      <Heading variant="h1">Unsubscribe</Heading>
      <p>Please select what you would like to unsubscribe from:</p>
      <NotificationSettings
        anonymousDetails={{
          userId,
          email,
        }}
      />
    </>
  )
}
