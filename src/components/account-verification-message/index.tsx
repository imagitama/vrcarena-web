import React, { useState } from 'react'
import useFirebaseUser from '@/hooks/useFirebaseUser'
import WarningMessage from '@/components/warning-message'
import { auth } from '@/firebase'
import Button from '@/components/button'
import { handleError } from '@/error-handling'
import LoadingIndicator from '@/components/loading-indicator'
import ErrorMessage from '@/components/error-message'
import SuccessMessage from '@/components/success-message'
import useAccountVerification from '@/hooks/useAccountVerification'
import { sendEmailVerification } from 'firebase/auth'
import useIsLoggedIn from '@/hooks/useIsLoggedIn'

enum FirebaseAuthErrorCode {
  EmailAlreadyInUse = 'auth/email-already-in-use',
  InvalidEmail = 'auth/invalid-email',
  OperationNotAllowed = 'auth/operation-not-allowed',
  WeakPassword = 'auth/weak-password',
  UserDisabled = 'auth/user-disabled',
  UserNotFound = 'auth/user-not-found',
  WrongPassword = 'auth/wrong-password',
  InvalidCredential = 'auth/invalid-credential',
  TooManyRequests = 'auth/too-many-requests',
  NetworkRequestFailed = 'auth/network-request-failed',
  RequiresRecentLogin = 'auth/requires-recent-login',
  PopupClosedByUser = 'auth/popup-closed-by-user',
  PopupBlocked = 'auth/popup-blocked',
  AccountExistsWithDifferentCredential = 'auth/account-exists-with-different-credential',
  CredentialAlreadyInUse = 'auth/credential-already-in-use',
  InvalidActionCode = 'auth/invalid-action-code',
  ExpiredActionCode = 'auth/expired-action-code',
  MissingEmail = 'auth/missing-email',
  InvalidVerificationCode = 'auth/invalid-verification-code',
  InvalidVerificationId = 'auth/invalid-verification-id',
  UnknownAuth = 'auth/unknown',
}

enum ErrorCode {
  Unknown = 'unknown',
}

const getErrorCodeFromError = (err: any): ErrorCode => {
  if (!('code' in err)) {
    return ErrorCode.Unknown
  }

  const code = err.code

  const knownCodes = Object.values(FirebaseAuthErrorCode) as string[]
  if (knownCodes.includes(code)) {
    return code as ErrorCode
  }

  return ErrorCode.Unknown
}

const AccountVerificationMessage = () => {
  const isLoggedIn = useIsLoggedIn()
  const isVerified = useAccountVerification()
  const [isSending, setIsSending] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [lastErrorCode, setLastErrorCode] = useState<null | ErrorCode>(null)

  if (!isLoggedIn || isVerified === null || isVerified === true) return null

  const ResentVerificationEmailButton = () => {
    const sendEmail = async () => {
      setIsSending(true)
      setIsSuccess(false)
      try {
        console.debug(`sending email verification...`)
        if (!auth.currentUser) {
          throw new Error('No current user')
        }
        if (!auth.currentUser.email) {
          throw new Error('User has no email')
        }
        await sendEmailVerification(auth.currentUser)
        console.debug(`sent successfully`)
        setIsSuccess(true)
        setIsSending(false)
      } catch (err) {
        console.error(err)
        handleError(err)
        setLastErrorCode(getErrorCodeFromError(err))
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

  return (
    <WarningMessage
      title="Verification"
      controls={[<ResentVerificationEmailButton />]}>
      Your email address has not been verified yet. Please find the verification
      email (you may need to check your spam) and perform the verification.
      <br />
      <br />
      Already verified but this message still shows? Please report this in our
      Discord server.
      {isSending ? (
        <>
          <br />
          <LoadingIndicator message="Sending..." />
        </>
      ) : null}
      {lastErrorCode !== null ? (
        <>
          <br />
          <ErrorMessage errorCode={lastErrorCode} noMargin>
            Failed to send
          </ErrorMessage>
        </>
      ) : null}
      {isSuccess ? (
        <>
          <br />
          <SuccessMessage noMargin>
            Verification email sent (please check your junk folder too)
          </SuccessMessage>
        </>
      ) : null}
    </WarningMessage>
  )
}

export default AccountVerificationMessage
