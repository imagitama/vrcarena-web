import React, { KeyboardEventHandler, useEffect, useState } from 'react'
import { makeStyles } from '@mui/styles'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import { AuthApiError, AuthError } from '@supabase/supabase-js'

import Button from '@/components/button'
import {
  Discord as DiscordIcon,
  Email as EmailIcon,
  Twitter as TwitterIcon,
  Google as GoogleIcon,
  Login as LoginIcon,
} from '@/icons'
import { handleError } from '@/error-handling'
import { routes } from '@/routes'
import { mediaQueryForMobiles } from '@/media-queries'

import LoginWithDiscord from '@/components/login-with-discord'
import LoadingIndicator from '@/components/loading-indicator'
import TextInput from '@/components/text-input'
import Link from '@/components/link'
import ErrorMessage from '@/components/error-message'
import FormControls from '@/components/form-controls'
import Center from '@/components/center'
import SignUpWithEmailForm from '@/components/signup-with-email-form'

import Heading from '../heading'
import MultiFactorAuthCodeInput from '../multi-factor-auth-code-input'
import { login, ProviderId } from '@/auth'
import PasswordInput from '../password-input'
import LoginWithOAuth from '../login-with-oauth'

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    margin: '2rem 0',
  },
  buttons: {
    display: 'flex',
    flexDirection: 'column',
  },
  form: {
    width: '100%',
    marginBottom: '2rem',
    display: 'flex',
    justifyContent: 'center',
  },
  loginButton: {
    margin: '0.25rem 0 !important',
  },
  loginWithEmailForm: {
    width: '500px',
    marginBottom: '2rem',
    maxWidth: '100%',
    [mediaQueryForMobiles]: {
      width: '100%',
    },
  },
  discord: {
    backgroundColor: '#7289da !important',
    '&:hover': {
      backgroundColor: '#445282 !important',
    },
  },
  email: {
    // default looking
  },
  google: {
    backgroundColor: '#4285f4 !important',
    '&:hover': {
      backgroundColor: '#2f6bd6 !important',
    },
  },
  twitter: {
    backgroundColor: '#1da1f2 !important',
    '&:hover': {
      backgroundColor: '#0c85d0 !important',
    },
  },
  signUpButton: {
    marginTop: '1rem !important',
  },
  cancelButton: {
    marginTop: '2rem !important',
  },
})

enum LoginStep {
  UsernameAndPassword,
  Totp,
}

const getErrorCodeFromError = (err: Error): string => {
  if (err instanceof AuthApiError) {
    // switch (err.code) {
    //   case 'invalid_credentials':
    //     return
    // }
    return err.code!
  }
  return 'unknown'
}

type AuthErrorCode = AuthError['code']

const getUserFriendlyMessageFromCode = (code: AuthErrorCode): string => {
  switch (code!) {
    case 'invalid_credentials':
      return 'username or password is incorrect'
    case 'email_not_confirmed':
      return 'your email has not been confirmed yet'
  }
  return code as string
}

const LoginWithEmailForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [isWorking, setIsWorking] = useState(false)
  const [lastErrorCode, setLastErrorCode] = useState<null | string>(null)
  const [usernameVal, setUsernameVal] = useState('')
  const [passwordVal, setPasswordVal] = useState('')
  const classes = useStyles()

  // 2fa
  const [step, setStep] = useState<LoginStep>(LoginStep.UsernameAndPassword)
  // const [resolver, setResolver] = useState<null | MultiFactorResolver>(null)

  if (step === LoginStep.Totp) {
    const onCode = async (code: string) => {
      try {
        console.debug(`submitting totp...`)

        setIsWorking(true)

        // if (!resolver) throw new Error('No resolver')

        // const totpFactor = resolver.hints.find((h) => h.factorId === 'totp')

        // if (!totpFactor) throw new Error('No factor')

        console.debug(`totp assertion...`)

        throw new Error('noop')
        console.debug(`resolving sign in...`)

        // await resolver.resolveSignIn(assertion)

        console.debug('user signed in!')

        onSuccess()
      } catch (err) {
        console.error('Failed to login:', err)
        handleError(err)
        setIsWorking(false)
        setLastErrorCode(getErrorCodeFromError(err as Error))
      }
    }

    return (
      <div>
        <Heading variant="h2">Two-Factor Authentication</Heading>
        <p>Enter the code from your MFA app:</p>
        <MultiFactorAuthCodeInput onCode={onCode} isDisabled={isWorking} />
        {isWorking && <LoadingIndicator message="Using your MFA code..." />}
        {lastErrorCode !== null ? (
          <ErrorMessage>Failed to use your MFA code: </ErrorMessage>
        ) : null}
      </div>
    )
  }

  const submitLogin = async () => {
    try {
      if (!usernameVal || !passwordVal) return

      console.debug(`signing in with email and password...`, {
        email: usernameVal,
      })

      setIsWorking(true)

      await login(usernameVal, passwordVal)

      setIsWorking(false)
      onSuccess()
    } catch (err) {
      console.error(err)
      handleError(err)
      setIsWorking(false)
      setLastErrorCode(getErrorCodeFromError(err as Error))
    }
  }

  const onKeyDown: KeyboardEventHandler = (e) => {
    if (e.key == 'Enter') {
      console.debug(`user pressed enter, submitting...`)
      submitLogin()
    }
  }

  return (
    <form className={classes.loginWithEmailForm}>
      <TextInput
        fullWidth
        value={usernameVal}
        onChange={(e) => setUsernameVal(e.target.value)}
        label="Email"
        autoFocus
        onKeyDown={onKeyDown}
        autoComplete="username"
      />
      <PasswordInput
        value={passwordVal}
        onChange={(val) => setPasswordVal(val)}
        fullWidth
        onKeyDown={onKeyDown}
      />
      <FormControls>
        <div>
          <br />
          <Center>
            <Button
              onClick={submitLogin}
              isDisabled={isWorking}
              icon={<LoginIcon />}>
              Login
            </Button>
          </Center>
          <br />
          Reset your password <Link to={routes.resetPassword}>here</Link>.
        </div>
      </FormControls>
      {isWorking && <LoadingIndicator message="Logging in..." />}
      {lastErrorCode !== null ? (
        <ErrorMessage errorCode={lastErrorCode}>
          Failed to login: {getUserFriendlyMessageFromCode(lastErrorCode)}
        </ErrorMessage>
      ) : null}
    </form>
  )
}

const LoginButton = ({
  label,
  className,
  providerId,
  icon,
  onClick,
  isSignUp,
}: {
  label: string
  className?: string
  providerId: null | string
  icon: React.ReactElement
  onClick?: () => void
  isSignUp: boolean
}) => {
  const classes = useStyles()
  return (
    <Button
      size="large"
      icon={icon}
      switchIconSide
      onClick={onClick}
      className={`${classes.loginButton} ${className}`}>
      {isSignUp ? 'Signup' : 'Login'} with {label}
    </Button>
  )
}

const Form = ({
  selectedProviderId,
  setSelectedProviderId,
  reset,
  onSuccess,
  isSignUp = false,
}: {
  selectedProviderId: null | string
  setSelectedProviderId: (id: null | string) => void
  reset: () => void
  onSuccess: () => void
  isSignUp?: boolean
}) => {
  const classes = useStyles()

  if (selectedProviderId != null) {
    switch (selectedProviderId) {
      case ProviderId.Discord:
      case ProviderId.Google:
      case ProviderId.Twitter:
        return (
          <div className={classes.form}>
            <LoginWithOAuth
              provider={selectedProviderId}
              onSuccess={onSuccess}
              onFail={reset}
            />
          </div>
        )
      case ProviderId.Email:
        return (
          <div className={classes.form}>
            {isSignUp ? (
              <SignUpWithEmailForm onSuccess={onSuccess} />
            ) : (
              <LoginWithEmailForm onSuccess={onSuccess} />
            )}
          </div>
        )
    }
  }

  return (
    <div className={classes.buttons}>
      <LoginButton
        isSignUp={isSignUp}
        label="email"
        providerId={ProviderId.Email}
        icon={<EmailIcon />}
        className={classes.email}
        onClick={() => setSelectedProviderId(ProviderId.Email)}
      />
      <LoginButton
        isSignUp={isSignUp}
        label="Discord"
        providerId={ProviderId.Discord}
        icon={<DiscordIcon />}
        className={classes.discord}
        onClick={() => setSelectedProviderId(ProviderId.Discord)}
      />
      <LoginButton
        isSignUp={isSignUp}
        label="Google"
        providerId={ProviderId.Google}
        icon={<GoogleIcon />}
        className={classes.google}
        onClick={() => setSelectedProviderId(ProviderId.Google)}
      />
      <LoginButton
        isSignUp={isSignUp}
        label="Twitter"
        providerId={ProviderId.Twitter}
        icon={<TwitterIcon />}
        className={classes.twitter}
        onClick={() => setSelectedProviderId(ProviderId.Twitter)}
      />
      <Button
        size="large"
        url={isSignUp ? routes.login : routes.signUp}
        className={classes.signUpButton}
        icon={<PersonAddIcon />}
        switchIconSide
        color="secondary">
        {isSignUp ? 'Return To Login' : 'Sign Up'}
      </Button>
    </div>
  )
}

const LoginForm = ({
  onSuccess,
  isSignUp = false,
}: {
  onSuccess: () => void
  isSignUp?: boolean
}) => {
  const classes = useStyles()
  const [selectedProviderId, setSelectedProviderId] = useState<null | string>(
    null
  )

  const reset = () => setSelectedProviderId(null)

  return (
    <div className={classes.root}>
      <Form
        onSuccess={onSuccess}
        isSignUp={isSignUp}
        reset={reset}
        selectedProviderId={selectedProviderId}
        setSelectedProviderId={setSelectedProviderId}
      />
      {selectedProviderId !== null && (
        <Button
          onClick={reset}
          color="secondary"
          className={classes.cancelButton}>
          Cancel {isSignUp ? 'Signup' : 'Login'}
        </Button>
      )}
    </div>
  )
}

export default LoginForm
