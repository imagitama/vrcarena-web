import React from 'react'
import { Helmet } from 'react-helmet'
import { useHistory } from 'react-router-dom'

import * as routes from '../../routes'
import { trackAction } from '../../analytics'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import useQueryParams from '../../hooks/useQueryParams'

import LoginForm from '../../components/login-form'
import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import ErrorMessage from '../../components/error-message'
import LoginWithDiscord from '../../components/login-with-discord'
import Link from '../../components/link'

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
      <Heading variant="h1">Login</Heading>
      <BodyText>Enter your details below to login.</BodyText>
      <LoginForm
        onSuccess={() => {
          trackAction('Login', 'Click login button')
          const fromPath = queryParams.get('from')
          push(fromPath || routes.home)
        }}
      />
      <BodyText>
        You can read our <Link to={routes.privacyPolicy}>Privacy Policy</Link>{' '}
        here.
      </BodyText>
      <BodyText>
        Reset your password <Link to={routes.resetPassword}>here</Link>.
      </BodyText>
    </>
  )
}
