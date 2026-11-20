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

enum ErrorCode {
  Unknown,
}

const ResetPasswordForm = () => {
  const [emailValue, setEmailValue] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [hasSent, setHasSent] = useState(false)
  const [lastErrorCode, setLastErrorCode] = useState<null | ErrorCode>(null)
  const passwordNeedsChanging = useSelector<RootState, boolean>(
    ({ user }) => user.passwordNeedsChanging
  )

  const onClickSend = async () => {
    try {
      if (!emailValue) {
        return
      }

      setIsSending(true)
      setHasSent(false)
      setLastErrorCode(null)

      const { error } = await client.auth.resetPasswordForEmail(emailValue, {
        redirectTo: `${location.origin}${routes.resetPassword}`,
      })
      if (error) throw error

      setIsSending(false)
      setHasSent(true)
      setLastErrorCode(null)
    } catch (err) {
      console.error(err)
      handleError(err)

      setLastErrorCode(ErrorCode.Unknown)
      setIsSending(false)
      setHasSent(false)
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
        Failed to send password reset email
      </ErrorMessage>
    )
  }

  if (hasSent) {
    return <SuccessMessage>Password reset email has been sent</SuccessMessage>
  }

  return (
    <>
      <TextInput
        value={emailValue}
        onChange={(e) => setEmailValue(e.target.value)}
        label="Email address"
        style={{ width: '500px' }}
      />
      <FormControls>
        <Button onClick={onClickSend}>Send Reset Email</Button>
      </FormControls>
    </>
  )
}

export default ResetPasswordForm
