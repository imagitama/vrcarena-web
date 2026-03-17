import React from 'react'
import { Helmet } from 'react-helmet'
import { useHistory } from 'react-router-dom'

import * as routes from '../../routes'
import { trackAction } from '../../analytics'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import useQueryParams from '../../hooks/useQueryParams'

import LoginForm from '../../components/login-form'
import ErrorMessage from '../../components/error-message'
import LoginWithDiscord from '../../components/login-with-discord'

export default () => {
  const firebaseUserId = useFirebaseUserId()
  const queryParams = useQueryParams()
  const { push } = useHistory()

  if (firebaseUserId && !queryParams.get('code')) {
    return <ErrorMessage>You are already logged in</ErrorMessage>
  }

  if (queryParams.get('code')) {
    return (
      <LoginWithDiscord
        code={queryParams.get('code')!}
        onSuccess={() => push(routes.myAccount)}
        onFail={() => push(routes.login)}
      />
    )
  }

  return (
    <>
      <Helmet>
        <title>Login to manage your account | VRCArena</title>
        <meta
          name="description"
          content="Login to upload and manage your assets, change your account and more."
        />
      </Helmet>
      <LoginForm
        onSuccess={() => {
          trackAction('Login', 'Click login button')
          const fromPath = queryParams.get('from')
          push(fromPath || routes.home)
        }}
      />
    </>
  )
}
