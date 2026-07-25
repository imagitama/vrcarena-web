import { auth, getHasMfaEnabled, loggedInUser } from '@/firebase'
import { useState } from 'react'
import SuccessMessage from '../success-message'
import MultiFactorAuthCodeInput from '../multi-factor-auth-code-input'
import Button from '../button'
import {
  multiFactor,
  TotpMultiFactorGenerator,
  TotpSecret,
} from 'firebase/auth'
import { handleError } from '@/error-handling'
import { FirebaseError } from 'firebase/app'
import FormControls from '../form-controls'
import ErrorMessage from '../error-message'
import WarningMessage from '../warning-message'
import QrCode from '../qr-code'
import { getHasUserVerifiedTheirEmail } from '@/auth'

enum Step {
  Start,
  Scan,
  Enrolled,
  Unenrolled, // after manually unenrolling
}

enum ErrorCode {
  Unknown = 'unknown',
  NoEmail = 'no-email',
  EmailUnverified = 'email-unverified',
}

enum FirebaseErrorCode {
  'auth/invalid-argument' = 'auth/invalid-argument', // when using emulator (https://github.com/firebase/firebase-tools/issues/6224)
}

const getMessageForCode = (code: string): string => {
  switch (code) {
    case ErrorCode.NoEmail:
      return 'MFA is only allowed for email sign-ups at this time'
    case ErrorCode.EmailUnverified:
      return 'MFA can only be enabled for verified accounts'
    case FirebaseErrorCode['auth/invalid-argument']:
      return 'MFA unavailable'
    default:
      return `Error code: ${code}`
  }
}

const getErrorCodeFromError = (err: Error): string => {
  if (err instanceof FirebaseError) {
    return err.code
  }
  return 'unknown'
}

const MultiFactorAuthForm = () => {
  const [step, setStep] = useState(
    getHasMfaEnabled() ? Step.Enrolled : Step.Start
  )
  const [isWorking, setIsWorking] = useState(false)
  const [lastErrorCode, setLastErrorCode] = useState<null | string>(null)
  const [secret, setSecret] = useState<null | TotpSecret>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<null | string>(null)

  if (!loggedInUser) return null

  if (!loggedInUser.email) {
    return <>You did not sign up with an email address</>
  }

  switch (step) {
    case Step.Start:
      const onClickEnable = async () => {
        try {
          setIsWorking(true)

          console.debug(`enabling MFA...`)

          const user = auth.currentUser
          if (!user) {
            console.error('No auth current user')
            return
          }

          if (!user.email) {
            setLastErrorCode(ErrorCode.NoEmail)
            return
          }

          if (!getHasUserVerifiedTheirEmail(user)) {
            setLastErrorCode(ErrorCode.EmailUnverified)
            return
          }

          console.debug(`getting MFA session...`)

          const session = await multiFactor(user).getSession()
          const totpSecret = await TotpMultiFactorGenerator.generateSecret(
            session
          )

          setSecret(totpSecret)
          setQrCodeUrl(totpSecret.generateQrCodeUrl(user.email, 'VRCArena'))
          setIsWorking(false)
          setStep(Step.Scan)
        } catch (err) {
          console.error(err)
          handleError(err)
          setIsWorking(false)
          setLastErrorCode(getErrorCodeFromError(err as Error))
        }
      }

      return (
        <>
          <WarningMessage>
            MFA is only allowed for email sign-ups only at this time
          </WarningMessage>
          Click this button to enable MFA on your account:
          <FormControls>
            <Button onClick={onClickEnable}>Enable MFA</Button>
          </FormControls>
          {lastErrorCode !== null && (
            <ErrorMessage>{getMessageForCode(lastErrorCode)}</ErrorMessage>
          )}
        </>
      )
    case Step.Scan:
      const onCode = async (code: string) => {
        try {
          setIsWorking(true)

          const user = auth.currentUser
          if (!user || !secret) return

          const assertion = TotpMultiFactorGenerator.assertionForEnrollment(
            secret,
            code
          )

          await multiFactor(user).enroll(assertion, 'VRCArena')

          setIsWorking(false)
          setStep(Step.Enrolled)
        } catch (err) {
          console.error(err)
          handleError(err)
          setIsWorking(false)
          setLastErrorCode(getErrorCodeFromError(err as Error))
        }
      }

      return (
        <>
          <p>
            Scan this QR code using your authentication app (eg. Authy, Google
            Authenticator):
          </p>
          {qrCodeUrl ? <QrCode url={qrCodeUrl} /> : '(waiting for QR code)'}
          <p>
            Or enter this code manually:{' '}
            {secret ? secret.secretKey : '(no secret)'}
          </p>
          <hr />
          Enter the MFA code to confirm:
          <MultiFactorAuthCodeInput onCode={onCode} />
        </>
      )
    case Step.Enrolled:
      const onClickRemove = async () => {
        try {
          setIsWorking(true)

          const user = auth.currentUser!

          const factors = multiFactor(user).enrolledFactors
          const totpFactor = factors.find((f) => f.factorId === 'totp')

          if (!totpFactor) throw new Error('No totp')

          await multiFactor(user!).unenroll(totpFactor)

          setIsWorking(false)
          setStep(Step.Unenrolled)
        } catch (err) {
          console.error(err)
          handleError(err)
          setIsWorking(false)
          setLastErrorCode(getErrorCodeFromError(err as Error))
        }
      }

      return (
        <SuccessMessage>
          MFA has been enabled for your account
          <br />
          <br />
          <Button onClick={onClickRemove}>Remove MFA</Button>
        </SuccessMessage>
      )

    case Step.Unenrolled:
      return (
        <SuccessMessage>MFA has been removed from your account</SuccessMessage>
      )
  }
}

export default MultiFactorAuthForm
