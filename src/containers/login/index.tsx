import React from 'react'
import { Helmet } from '@unhead/react/helmet'
import { useHistory } from 'react-router-dom'

import * as routes from '@/routes'
import { trackAction } from '@/analytics'

import useQueryParams from '@/hooks/useQueryParams'

import LoginForm from '@/components/login-form'

export default () => {
  const queryParams = useQueryParams()
  const { push } = useHistory()

  return (
    <>
      <Helmet>
        <title>Login to manage your account</title>
        <meta
          name="description"
          content="Login to upload and manage your clubs, events, change your account and more."
        />
      </Helmet>
      <LoginForm
        onSuccess={() => {
          trackAction('Login', 'Click login button')
          const fromPath = queryParams.get('from')

          const newRoute =
            !fromPath || fromPath.includes(routes.login)
              ? routes.home
              : fromPath

          console.debug(`login was successful! redirecting to "${newRoute}"...`)

          push(newRoute)
        }}
      />
    </>
  )
}
