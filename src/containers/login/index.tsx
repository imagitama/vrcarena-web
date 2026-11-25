import React from 'react'
import { Helmet } from '@unhead/react/helmet'
import { useHistory } from 'react-router-dom'

import * as routes from '@/routes'
import { trackAction } from '@/analytics'

import useSupabaseUserId from '@/hooks/useSupabaseUserId'
import useQueryParams from '@/hooks/useQueryParams'

import LoginForm from '@/components/login-form'
import ErrorMessage from '@/components/error-message'
import LoginWithDiscord from '@/components/login-with-discord'

export default () => {
  // const userId = useSupabaseUserId()
  const queryParams = useQueryParams()
  const { push } = useHistory()

  // if (userId && !queryParams.get('code')) {
  //   return <ErrorMessage>You are already logged in</ErrorMessage>
  // }

  // if (queryParams.get('code')) {
  //   return (
  //     <LoginWithDiscord
  //       code={queryParams.get('code')!}
  //       onSuccess={() => push(routes.myAccount)}
  //       onFail={() => push(routes.login)}
  //     />
  //   )
  // }

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
