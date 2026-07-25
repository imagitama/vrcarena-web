import React, { useState } from 'react'
import SaveIcon from '@mui/icons-material/Save'

import Button from '@/components/button'
import TextInput from '@/components/text-input'
import LoadingIndicator from '@/components/loading-indicator'
import ErrorMessage from '@/components/error-message'
import { changeLoggedInUserEmail, loggedInUser } from '@/firebase'
import { handleError } from '@/error-handling'
import SuccessMessage from '@/components/success-message'
import FormControls from '@/components/form-controls'
import { FirebaseError } from 'firebase/app'

const getIsValidEmail = (input: string): boolean =>
  String(input)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    ) !== null

const getErrorCodeFromError = (err: Error): string => {
  if (err instanceof FirebaseError) {
    return err.code
  }
  return 'unknown'
}

const ChangeEmailForm = () => {
  const [emailInput, setEmailInput] = useState(
    loggedInUser && loggedInUser.email ? loggedInUser.email : ''
  )
  const [isChanging, setIsChanging] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [lastErrorCode, setLastErrorCode] = useState<null | string>(null)

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
      setLastErrorCode(null)
      await changeLoggedInUserEmail(emailInput.trim())
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
          Save
        </Button>
      </FormControls>
      {isChanging ? (
        <LoadingIndicator message="Changing email..." />
      ) : isSuccess ? (
        <SuccessMessage>Your email has been changed</SuccessMessage>
      ) : lastErrorCode !== null ? (
        <ErrorMessage>
          Failed to change your email (code {lastErrorCode}). If it keeps
          happening please contact us on our Discord server and we can
          investigate and potentially manually update your account.
        </ErrorMessage>
      ) : null}
    </>
  )
}

export default ChangeEmailForm
