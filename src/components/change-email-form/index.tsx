import React, { useState } from 'react'
import SaveIcon from '@mui/icons-material/Save'

import Button from '../button'
import TextInput from '../text-input'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import { changeLoggedInUserEmail, loggedInUser } from '../../firebase'
import { handleError } from '../../error-handling'
import SuccessMessage from '../success-message'
import FormControls from '../form-controls'

const getIsValidEmail = (input: string): boolean =>
  String(input)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    ) !== null

const ChangeEmailForm = () => {
  const [emailInput, setEmailInput] = useState(
    loggedInUser && loggedInUser.email ? loggedInUser.email : ''
  )
  const [isChanging, setIsChanging] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // TODO: Store last error code
  const [isFailed, setIsFailed] = useState(false)

  if (!loggedInUser) {
    return null
  }

  if (!loggedInUser.email) {
    return <>You did not sign up with an email address</>
  }

  const onClickChange = async () => {
    try {
      setIsChanging(true)
      setIsSuccess(false)
      setIsFailed(false)
      await changeLoggedInUserEmail(emailInput.trim())
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
        value={emailInput}
        onChange={(e) => setEmailInput(e.target.value)}
        fullWidth
        type="email"
        isDisabled={isChanging}
      />
      <FormControls>
        <Button
          isDisabled={!getIsValidEmail(emailInput.trim()) || isChanging}
          onClick={onClickChange}
          icon={<SaveIcon />}>
          Change Email
        </Button>
      </FormControls>
      {isChanging ? (
        <LoadingIndicator message="Changing email..." />
      ) : isSuccess ? (
        <SuccessMessage>Your email has been changed</SuccessMessage>
      ) : isFailed ? (
        <ErrorMessage>
          Failed to change your email. Please try logging out and in, then
          trying again
        </ErrorMessage>
      ) : null}
    </>
  )
}

export default ChangeEmailForm
