import React, { useState } from 'react'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import SuccessMessage from '../success-message'
import Button from '../button'
import TextInput from '../text-input'

import { auth } from '../../firebase'
import { handleError } from '../../error-handling'

export default () => {
  const [emailValue, setEmailValue] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [hasSent, setHasSent] = useState(false)
  const [isErrored, setIsErrored] = useState(false)

  const onClickSend = async () => {
    try {
      if (!emailValue) {
        return
      }

      setIsSending(true)
      setHasSent(false)
      setIsErrored(false)

      await auth.sendPasswordResetEmail(emailValue)

      setIsSending(false)
      setHasSent(true)
      setIsErrored(false)
    } catch (err) {
      setIsSending(false)
      setHasSent(false)
      setIsErrored(true)

      console.error(err)
      handleError(err)
    }
  }

  const reset = () => {
    setIsSending(false)
    setHasSent(false)
    setIsErrored(false)
  }

  if (isSending === true) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return (
      <ErrorMessage>
        Failed to send password reset email
        <br />
        <br />
        <Button onClick={reset}>Try Again</Button>
      </ErrorMessage>
    )
  }

  if (hasSent) {
    return <SuccessMessage>Password reset email has been sent</SuccessMessage>
  }

  return (
    <>
      Enter your email address:
      <TextInput
        value={emailValue}
        onChange={e => setEmailValue(e.target.value)}
      />
      <Button onClick={onClickSend}>Send Reset Email</Button>
    </>
  )
}
