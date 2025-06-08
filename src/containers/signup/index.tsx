import React from 'react'
import { useHistory } from 'react-router-dom'
import { Helmet } from 'react-helmet'

import * as routes from '../../routes'
import { trackAction } from '../../analytics'
import useUserRecord from '../../hooks/useUserRecord'

import Link from '../../components/link'
import LoginForm from '../../components/login-form'
import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import ErrorMessage from '../../components/error-message'

export default () => {
  const [, , user] = useUserRecord()
  const { push } = useHistory()

  if (user) {
    return <ErrorMessage>You are already logged in</ErrorMessage>
  }

  return (
    <>
      <Helmet>
        <title>Sign up to create an account | VRCArena</title>
        <meta
          name="description"
          content="Create an account on the site to upload and manage assets, comment and more."
        />
      </Helmet>
      <Heading variant="h1">Sign Up</Heading>
      <BodyText>Enter your details below to create a new account.</BodyText>
      <br />
      <br />
      <LoginForm
        onSuccess={() => {
          trackAction('Signup', 'Click sign-up button')
          push(routes.setupProfile)
        }}
      />
      <BodyText>
        You can read our <Link to={routes.privacyPolicy}>Privacy Policy</Link>{' '}
        here.
      </BodyText>
    </>
  )
}
