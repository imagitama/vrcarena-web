import React, { useState } from 'react'
import SaveIcon from '@material-ui/icons/Save'

import Button from '../button'
import TextInput from '../text-input'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import { changeLoggedInUserPassword, loggedInUser } from '../../firebase'
import { handleError } from '../../error-handling'
import SuccessMessage from '../success-message'
import FormControls from '../form-controls'

const ChangePasswordForm = () => {
  const [passwordInput, setPasswordInput] = useState('')
  const [isChanging, setIsChanging] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isFailed, setIsFailed] = useState(false)

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
      setIsFailed(false)
      await changeLoggedInUserPassword(passwordInput)
      setIsChanging(false)
      setIsSuccess(true)
      setIsFailed(false)
    } catch (err) {
      handleError(err)
      console.error(err)
      setIsChanging(false)
      setIsSuccess(false)
      setIsFailed(true)
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
          Change Password
        </Button>
      </FormControls>
      {isChanging ? (
        <LoadingIndicator message="Changing password..." />
      ) : isSuccess ? (
        <SuccessMessage>Your password has been changed</SuccessMessage>
      ) : isFailed ? (
        <ErrorMessage>
          Failed to change your password. Please try logging out and in, then
          trying again
        </ErrorMessage>
      ) : null}
    </>
  )
}

export default ChangePasswordForm
