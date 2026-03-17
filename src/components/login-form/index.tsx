import React, { KeyboardEventHandler, useEffect, useState } from 'react'
import { makeStyles } from '@mui/styles'
import {
  EmailAuthProvider,
  GoogleAuthProvider,
  TwitterAuthProvider,
  signInWithEmailAndPassword,
  AuthErrorCodes,
} from 'firebase/auth'
import { auth } from '../../firebase'
import Button from '../button'
import {
  Discord as DiscordIcon,
  Email as EmailIcon,
  Twitter as TwitterIcon,
  Google as GoogleIcon,
  Login as LoginIcon,
} from '../../icons'
import LoginWithDiscord from '../login-with-discord'
import LoadingIndicator from '../loading-indicator'
import { handleError } from '@/error-handling'
import TextInput from '../text-input'
import Link from '../link'
import { routes } from '@/routes'
import ErrorMessage from '../error-message'
import { FirebaseError } from 'firebase/app'
import FormControls from '../form-controls'
import Center from '../center'
import { signinWithProvider } from './utils'
import SignUpWithEmailForm from '../signup-with-email-form'
import Message from '../message'
import { DISCORD_URL, EMAIL } from '@/config'

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
    marginBottom: '2rem',
  },
  loginButton: {
    margin: '0.25rem 0 !important',
  },
  loginWithEmailForm: {
    width: '500px',
    marginBottom: '2rem',
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
    color: '#000 !important',
    backgroundColor: '#ffffff !important',
    '&:hover': {
      backgroundColor: '#b0b0b0 !important',
    },
  },
  twitter: {
    backgroundColor: '#55acee !important',
    '&:hover': {
      backgroundColor: '#3d7bab !important',
    },
  },
  signUpButton: {
    marginTop: '1rem !important',
    '& > *': {
      width: '100%', // button inside anchor screws it up
    },
  },
  cancelButton: {
    marginTop: '2rem !important',
  },
})

const LoginWithProviderForm = ({
  providerId,
  onSuccess,
}: {
  providerId: string
  onSuccess: () => void
}) => {
  const [lastErrorCode, setLastErrorCode] = useState<null | string>(null)

  useEffect(() => {
    ;(async () => {
      try {
        let provider

        switch (providerId) {
          case EmailAuthProvider.PROVIDER_ID:
            provider = new EmailAuthProvider()
            break
          case GoogleAuthProvider.PROVIDER_ID:
            provider = new GoogleAuthProvider()
            break
          case TwitterAuthProvider.PROVIDER_ID:
            provider = new TwitterAuthProvider()
            break
          default:
            throw new Error(`Unknown provider ID: ${providerId}`)
        }

        const user = await signinWithProvider(provider)

        onSuccess()
      } catch (err) {
        if (err instanceof FirebaseError) {
          const code = err.code
          setLastErrorCode(code)
        } else {
          console.error(err)
          handleError(err)
        }
      }
    })()
  }, [])

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>
        Failed to login: {getMessageForFirebaseErrorCode(lastErrorCode)}
      </ErrorMessage>
    )
  }

  return <LoadingIndicator message="Showing popup..." />
}

const getMessageForFirebaseErrorCode = (errorCode: string) => {
  switch (errorCode) {
    case AuthErrorCodes.INVALID_EMAIL:
      return 'invalid email'
    case AuthErrorCodes.INVALID_PASSWORD:
      return 'invalid password'
    // not in TS?
    case 'auth/missing-password':
      return 'missing password'
    case 'auth/user-not-found':
      return 'email has never signed up here'
    case AuthErrorCodes.MISSING_AUTH_DOMAIN: // needs REACT_APP_FIREBASE_AUTH_DOMAIN
      return 'needs config'
    default:
      return `Error ${errorCode}`
  }
}

const LoginWithEmailForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [isWorking, setIsWorking] = useState(false)
  const [lastErrorCode, setLastErrorCode] = useState<null | string>(null)
  const [usernameVal, setUsernameVal] = useState('')
  const [passwordVal, setPasswordVal] = useState('')
  const classes = useStyles()

  const submit = async () => {
    try {
      if (!usernameVal || !passwordVal) return

      console.debug(`signing in with email and password...`, {
        email: usernameVal,
      })

      setIsWorking(true)

      const user = await signInWithEmailAndPassword(
        auth,
        usernameVal,
        passwordVal
      )

      console.debug(`signin success`, { email: usernameVal, user })

      setIsWorking(false)
      onSuccess()
    } catch (err) {
      setIsWorking(false)

      if (err instanceof FirebaseError) {
        const code = err.code
        setLastErrorCode(code)
      } else {
        console.error(err)
        handleError(err)
      }
    }
  }

  const onKeyDown: KeyboardEventHandler = (e) => {
    if (e.key == 'Enter') {
      console.debug(`user pressed enter, submitting...`)
      submit()
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
      />
      <br />
      <TextInput
        fullWidth
        value={passwordVal}
        onChange={(e) => setPasswordVal(e.target.value)}
        label="Password"
        type="password"
        onKeyDown={onKeyDown}
      />
      <FormControls>
        <div>
          <br />
          <Center>
            <Button
              onClick={submit}
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
      {lastErrorCode != null ? (
        <ErrorMessage>
          Failed to login: {getMessageForFirebaseErrorCode(lastErrorCode)}
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

const DISCORD_PROVIDER_ID = 'discord'

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
      case DISCORD_PROVIDER_ID:
        return (
          <div className={classes.form}>
            <LoginWithDiscord code={''} onFail={reset} onSuccess={onSuccess} />
          </div>
        )
      case GoogleAuthProvider.PROVIDER_ID:
      case TwitterAuthProvider.PROVIDER_ID:
        return (
          <div className={classes.form}>
            <LoginWithProviderForm
              providerId={selectedProviderId}
              onSuccess={onSuccess}
            />
          </div>
        )
      case EmailAuthProvider.PROVIDER_ID:
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
        providerId={EmailAuthProvider.PROVIDER_ID}
        icon={<EmailIcon />}
        className={classes.email}
        onClick={() => setSelectedProviderId(EmailAuthProvider.PROVIDER_ID)}
      />
      <LoginButton
        isSignUp={isSignUp}
        label="Discord"
        providerId={DISCORD_PROVIDER_ID}
        icon={<DiscordIcon />}
        className={classes.discord}
        onClick={() => setSelectedProviderId(DISCORD_PROVIDER_ID)}
      />
      <LoginButton
        isSignUp={isSignUp}
        label="Google"
        providerId={GoogleAuthProvider.PROVIDER_ID}
        icon={<GoogleIcon />}
        className={classes.google}
        onClick={() => setSelectedProviderId(GoogleAuthProvider.PROVIDER_ID)}
      />
      <LoginButton
        isSignUp={isSignUp}
        label="Twitter/X"
        providerId={TwitterAuthProvider.PROVIDER_ID}
        icon={<TwitterIcon />}
        className={classes.twitter}
        onClick={() => setSelectedProviderId(TwitterAuthProvider.PROVIDER_ID)}
      />
      <Button
        size="large"
        url={isSignUp ? routes.login : routes.signUp}
        className={classes.signUpButton}>
        {isSignUp ? 'Login' : 'Sign Up'}
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
      <Message hideId="new-login-mar-2026" title="March 2026">
        To combat increasing spam we have created a new login form with added
        new spam protection. If you cannot sign up or login, please join our{' '}
        <a href={DISCORD_URL}>Discord server</a> or email us at {EMAIL}
      </Message>
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
