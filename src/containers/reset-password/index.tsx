import React from 'react'
import { Helmet } from '@unhead/react/helmet'

import ResetPasswordForm from '@/components/reset-password-form'
import Heading from '@/components/heading'
import BodyText from '@/components/body-text'

export default () => (
  <>
    <Helmet>
      <title>Reset password</title>
      <meta
        name="description"
        content="Use this form to reset your password."
      />
    </Helmet>
    <Heading variant="h1">Reset Password</Heading>
    <ResetPasswordForm />
  </>
)
