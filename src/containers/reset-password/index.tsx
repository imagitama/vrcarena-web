import React from 'react'
import { Helmet } from 'react-helmet'

import ResetPasswordForm from '../../components/reset-password-form'
import Heading from '../../components/heading'

export default () => (
  <>
    <Helmet>
      <title>Reset password | VRCArena</title>
      <meta
        name="description"
        content="Use this form to reset your password."
      />
    </Helmet>
    <Heading variant="h1">Reset Password</Heading>
    <ResetPasswordForm />
  </>
)
