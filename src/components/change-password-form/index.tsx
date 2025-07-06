import React, { useState } from 'react'
import SaveIcon from '@mui/icons-material/Save'

import Button from '../button'
import TextInput from '../text-input'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import { changeLoggedInUserPassword, loggedInUser } from '../../firebase'
import { handleError } from '../../error-handling'
import SuccessMessage from '../success-message'
import FormControls from '../form-controls'

enum ErrorCode {
  Unknown,
}

const ChangePasswordForm = () => {
  const [passwordInput, setPasswordInput] = useState('')
  const [isChanging, setIsChanging] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [lastErrorCode, setLastErrorCode] = useState<null | ErrorCode>(null)

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
      setLastErrorCode(ErrorCode.Unknown)
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
          Failed to change your password. Please try logging out and in, then
          trying again (code {lastErrorCode})
        </ErrorMessage>
      ) : null}
    </>
  )
}

export default ChangePasswordForm
