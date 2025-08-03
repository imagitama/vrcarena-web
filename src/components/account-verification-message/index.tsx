import React, { useState } from 'react'
import useFirebaseUser from '../../hooks/useFirebaseUser'
import WarningMessage from '../warning-message'
import { auth } from '../../firebase'
import Button from '../button'
import { handleError } from '../../error-handling'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import SuccessMessage from '../success-message'
import useAccountVerification from '../../hooks/useAccountVerification'
import { sendEmailVerification } from 'firebase/auth'

enum ErrorCode {
  Unknown,
}

const AccountVerificationMessage = () => {
  const firebaseUser = useFirebaseUser()
  const isVerified = useAccountVerification() // NOTE: use this hook as it does extra functionality
  const [isSending, setIsSending] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [lastErrorCode, setLastErrorCode] = useState<null | ErrorCode>(null)

  const ResentVerificationEmailButton = () => {
    const sendEmail = async () => {
      setIsSending(true)
      setIsSuccess(false)
      try {
        if (!auth.currentUser) {
          throw new Error('No current user')
        }
        console.debug(`sending email verificationn...`)
        await sendEmailVerification(auth.currentUser)
        console.debug(`sent successfully`)
        setIsSuccess(true)
        setIsSending(false)
      } catch (err) {
        console.error(err)
        handleError(err)
        setLastErrorCode(ErrorCode.Unknown)
        setIsSending(false)
        setIsSuccess(false)
      }
    }

    return (
      <Button color="secondary" onClick={sendEmail}>
        Re-send Email
      </Button>
    )
  }

  if (firebaseUser && !isVerified) {
    return (
      <WarningMessage
        title="Verification"
        controls={[<ResentVerificationEmailButton />]}>
        Your email address has not been verified yet. Please find the
        verification email (you may need to check your spam) and perform the
        verification.
        {isSending ? <LoadingIndicator message="Sending..." /> : null}
        {lastErrorCode !== null ? (
          <ErrorMessage>Failed to send (code {lastErrorCode})</ErrorMessage>
        ) : null}
        {isSuccess ? <SuccessMessage>Email sent</SuccessMessage> : null}
        <br />
        <br />
        Already verified but this message still shows? Please report this in our
        Discord server.
      </WarningMessage>
    )
  }

  return null
}

export default AccountVerificationMessage
