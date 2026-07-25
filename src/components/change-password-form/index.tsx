import React, { useState } from 'react'
import SaveIcon from '@mui/icons-material/Save'

import Button from '@/components/button'
import TextInput from '@/components/text-input'
import LoadingIndicator from '@/components/loading-indicator'
import ErrorMessage from '@/components/error-message'
import { changeLoggedInUserPassword, loggedInUser } from '@/firebase'
import { handleError } from '@/error-handling'
import SuccessMessage from '@/components/success-message'
import FormControls from '@/components/form-controls'
import { FirebaseError } from 'firebase/app'

const getErrorCodeFromError = (err: Error): string => {
  if (err instanceof FirebaseError) {
    return err.code
  }
  return 'unknown'
}

const ChangePasswordForm = () => {
  const [passwordInput, setPasswordInput] = useState('')
  const [isChanging, setIsChanging] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [lastErrorCode, setLastErrorCode] = useState<null | string>(null)

  if (!loggedInUser) {
    return null
  }

  if (!loggedInUser.email) {
    return (
      <>
        You did not sign up with an email address so you cannot change your
        password
      </>
    )
  }

  const onClickChange = async () => {
    try {
      setIsChanging(true)
      setIsSuccess(false)
      setLastErrorCode(null)
      await changeLoggedInUserPassword(passwordInput)
      setIsChanging(false)
      setIsSuccess(true)
      setLastErrorCode(null)
    } catch (err) {
      handleError(err)
      console.error(err)
      setIsChanging(false)
      setIsSuccess(false)
      setLastErrorCode(getErrorCodeFromError(err as Error))
    }
  }

  return (
    <>
      <TextInput
        value={passwordInput}
        onChange={(e) => setPasswordInput(e.target.value)}
        fullWidth
        type="password"
        isDisabled={isChanging}
      />
      <FormControls>
        <Button
          isDisabled={!passwordInput || isChanging}
          onClick={onClickChange}
          icon={<SaveIcon />}>
          Save
        </Button>
      </FormControls>
      {isChanging ? (
        <LoadingIndicator message="Changing password..." />
      ) : isSuccess ? (
        <SuccessMessage>Your password has been changed</SuccessMessage>
      ) : lastErrorCode !== null ? (
        <ErrorMessage>
          Failed to change your password (code {lastErrorCode}). If it keeps
          happening please contact us on our Discord server and we can
          investigate and potentially manually update your account.
        </ErrorMessage>
      ) : null}
    </>
  )
}

export default ChangePasswordForm
