import React, { useState } from 'react'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import SuccessMessage from '../success-message'
import Button from '../button'
import TextInput from '../text-input'

import { auth } from '../../firebase'
import { handleError } from '../../error-handling'
import FormControls from '../form-controls'

enum ErrorCode {
  Unknown,
}

const ResetPasswordForm = () => {
  const [emailValue, setEmailValue] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [hasSent, setHasSent] = useState(false)
  const [lastErrorCode, setLastErrorCode] = useState<null | ErrorCode>(null)

  const onClickSend = async () => {
    try {
      if (!emailValue) {
        return
      }

      setIsSending(true)
      setHasSent(false)
      setLastErrorCode(null)

      await auth.sendPasswordResetEmail(emailValue)

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

  if (isSending === true) {
    return <LoadingIndicator />
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage onRetry={reset}>
        Failed to send password reset email (code {lastErrorCode})
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
