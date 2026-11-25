import { useEffect, useState } from 'react'
import VpnKeyIcon from '@mui/icons-material/VpnKey'

import { handleError } from '@/error-handling'
import { getHasUserVerifiedTheirEmail, getSignedUpWithEmail } from '@/auth'

import useSupabaseUser from '@/hooks/useSupabaseUser'

import SuccessMessage from '@/components/success-message'
import MultiFactorAuthCodeInput from '@/components/multi-factor-auth-code-input'
import Button from '@/components/button'
import FormControls from '@/components/form-controls'
import ErrorMessage from '@/components/error-message'
import QrCode from '@/components/qr-code'
import Message from '@/components/message'
import { client } from '@/supabase'
import Heading from '../heading'
import { inDevelopment } from '@/environment'

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

const getMessageForCode = (code: string): string => {
  switch (code) {
    case ErrorCode.NoEmail:
      return 'MFA is only allowed for email sign-ups at this time'
    case ErrorCode.EmailUnverified:
      return 'MFA can only be enabled for verified accounts'
    // case FirebaseErrorCode['auth/invalid-argument']:
    //   return 'MFA unavailable'
    // case FirebaseErrorCode['auth/requires-recent-login']:
    //   // TODO: prompt to login instead of doing this
    //   return 'You must have logged in recently (within approx 5 mins) before changing your MFA settings. Logout then login and try again.'
    // case FirebaseErrorCode['auth/unsupported-first-factor']:
    //   return 'MFA is not available for your sign-up method'
    default:
      return `Error code: ${code}`
  }
}

const getErrorCodeFromError = (err: Error): string => {
  // outputting the error sucks but it's the quickest way to debug issues
  return `Unknown: ${err.message}`
}

const getHasMfaEnabled = async (): Promise<boolean> => {
  const { data, error } = await client.auth.mfa.listFactors()
  if (error) throw error

  // `totp` and `phone` contain only verified factors.
  // (`all` also includes unverified ones from abandoned enrollments.)
  return data.totp.length > 0 || data.phone.length > 0
}

const MultiFactorAuthForm = () => {
  const [step, setStep] = useState(Step.Start)
  const [isWorking, setIsWorking] = useState(false)
  const [lastErrorCode, setLastErrorCode] = useState<null | string>(null)
  const [factorId, setFactorId] = useState<null | string>(null)
  const [secret, setSecret] = useState<null | string>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<null | string>(null)
  const user = useSupabaseUser()

  useEffect(() => {
    ;(async () => {
      const isMfaEnabled = await getHasMfaEnabled()
      if (isMfaEnabled) setStep(Step.Enrolled)
    })()
  }, [])

  if (!user) return null

  if (!getSignedUpWithEmail(user)) {
    return (
      <Message>
        MFA is only available if you signed up with an email and password
      </Message>
    )
  }

  switch (step) {
    case Step.Start:
      const onClickEnable = async () => {
        try {
          setIsWorking(true)

          console.debug(`enabling MFA...`)

          // const user = auth.currentUser
          if (!user) {
            console.error('No auth current user')
            return
          }

          if (!user.email) {
            setLastErrorCode(ErrorCode.NoEmail)
            return
          }

          if (
            getSignedUpWithEmail(user) &&
            !getHasUserVerifiedTheirEmail(user)
          ) {
            setLastErrorCode(ErrorCode.EmailUnverified)
            return
          }

          console.debug(`unenrolling stale MFA...`)

          const { data: factors, error: listError } =
            await client.auth.mfa.listFactors()
          if (listError) throw listError

          const stale = factors.all.filter(
            (f) => f.factor_type === 'totp' && f.status === 'unverified'
          )
          await Promise.all(
            stale.map((f) => client.auth.mfa.unenroll({ factorId: f.id }))
          )

          console.debug(`enrolling MFA...`)

          const { data, error } = await client.auth.mfa.enroll({
            factorType: 'totp',
            issuer: inDevelopment() ? 'VRCArena DEV' : 'VRCArena', // shown in the authenticator app
            friendlyName: user.email, // must be unique per user
          })
          if (error) throw error

          setFactorId(data.id)
          setSecret(data.totp.secret) // for manual entry
          setQrCodeUrl(data.totp.qr_code) // replaces totpSecret.generateQrCodeUrl(...)

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
          Click this button to enable MFA on your account:
          <FormControls>
            <Button
              icon={<VpnKeyIcon />}
              onClick={onClickEnable}
              isDisabled={isWorking}>
              Enable MFA
            </Button>
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

          if (!factorId) throw new Error('No factor ID')
          if (!secret) throw new Error('No secret')

          const { error } = await client.auth.mfa.challengeAndVerify({
            factorId,
            code,
          })
          if (error) throw error

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
          <Heading variant="h4">Step 1</Heading>
          <p>
            Scan this QR code using your authentication app (eg. Authy, Google
            Authenticator):
          </p>
          {qrCodeUrl ? <QrCode svg={qrCodeUrl} /> : '(waiting for QR code)'}
          <p>Or enter this code manually: {secret}</p>
          <Heading variant="h4">Step 2</Heading>
          Enter the MFA code to confirm:
          <br />
          <br />
          <MultiFactorAuthCodeInput onCode={onCode} />
          {lastErrorCode !== null && (
            <ErrorMessage>{getMessageForCode(lastErrorCode)}</ErrorMessage>
          )}
        </>
      )
    case Step.Enrolled:
      const onClickRemove = async () => {
        try {
          setIsWorking(true)

          console.debug(`removing mfa...`)

          const { data: factors, error: listError } =
            await client.auth.mfa.listFactors()
          if (listError) throw listError

          const totpFactor = factors.totp[0] // `totp` contains only verified factors
          if (!totpFactor) throw new Error('No totp')

          console.debug('unenrolling...')
          const { error } = await client.auth.mfa.unenroll({
            factorId: totpFactor.id,
          })
          if (error) throw error

          console.debug(`unenroll successful`)

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
        <>
          <SuccessMessage>
            MFA has been enabled for your account
            <br />
            <br />
            <Button onClick={onClickRemove} color="secondary">
              Remove MFA
            </Button>
          </SuccessMessage>
          {lastErrorCode !== null && (
            <ErrorMessage>{getMessageForCode(lastErrorCode)}</ErrorMessage>
          )}
        </>
      )

    case Step.Unenrolled:
      return (
        <SuccessMessage>MFA has been removed from your account</SuccessMessage>
      )
  }
}

export default MultiFactorAuthForm
