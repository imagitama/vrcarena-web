import React, { useState } from 'react'

import { handleError } from '@/error-handling'

import LoadingIndicator from '@/components/loading-indicator'
import ErrorMessage from '@/components/error-message'
import SuccessMessage from '@/components/success-message'
import Button from '@/components/button'
import TextInput from '@/components/text-input'
import FormControls from '@/components/form-controls'
import { client } from '@/supabase'
import { routes } from '@/routes'
import { useSelector } from 'react-redux'
import { RootState } from '@/slices'
import ChangePasswordForm from '../change-password-form'
import Heading from '../heading'
import { AuthApiError } from '@supabase/supabase-js'
import { ErrorCode as AuthErrorCode } from '@supabase/auth-js/src/lib/error-codes'
import CaptchaInput from '../captcha-input'

const getErrorCodeFromError = (err: Error): string => {
  if (err instanceof AuthApiError) {
    return err.code!
  }
  return 'unknown'
}

const getUserFriendlyMessageFromCode = (code: string): string => {
  switch (code as AuthErrorCode) {
    case 'email_address_invalid':
      return 'invalid email address'
    case 'validation_failed':
      return 'invalid email address'
  }
  return code
}

const ResetPasswordForm = () => {
  const [emailValue, setEmailValue] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [hasSent, setHasSent] = useState(false)
  const [lastErrorCode, setLastErrorCode] = useState<null | string>(null)
  const passwordNeedsChanging = useSelector<RootState, boolean>(
    ({ user }) => user.passwordNeedsChanging
  )
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)

  const onClickSend = async () => {
    try {
      if (!emailValue || !captchaToken) {
        return
      }

      setIsSending(true)
      setHasSent(false)
      setLastErrorCode(null)

      const { error } = await client.auth.resetPasswordForEmail(emailValue, {
        redirectTo: `${location.origin}${routes.resetPassword}`,
        captchaToken,
      })
      if (error) throw error

      setIsSending(false)
      setHasSent(true)
      setLastErrorCode(null)
    } catch (err) {
      console.error(err)
      handleError(err)

      setLastErrorCode(getErrorCodeFromError(err as Error))
      setIsSending(false)
      setHasSent(false)
      setCaptchaToken(null)
    }
  }

  const reset = () => {
    setIsSending(false)
    setHasSent(false)
    setLastErrorCode(null)
  }

  if (passwordNeedsChanging) {
    return (
      <>
        <Heading variant="h2">Change Password</Heading>
        <ChangePasswordForm />
      </>
    )
  }

  if (isSending === true) {
    return <LoadingIndicator />
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage
        errorCode={lastErrorCode as unknown as string}
        onRetry={reset}>
        Failed to send password reset email:{' '}
        {getUserFriendlyMessageFromCode(lastErrorCode)}
      </ErrorMessage>
    )
  }

  if (hasSent) {
    return <SuccessMessage>Password reset email has been sent</SuccessMessage>
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <TextInput
          value={emailValue}
          onChange={(e) => setEmailValue(e.target.value)}
          label="Email address"
          style={{ width: '500px' }}
          type="email"
        />
        <CaptchaInput token={captchaToken} onToken={setCaptchaToken} />
      </div>
      <FormControls>
        <Button onClick={onClickSend}>Send Reset Email</Button>
      </FormControls>
    </>
  )
}

export default ResetPasswordForm
