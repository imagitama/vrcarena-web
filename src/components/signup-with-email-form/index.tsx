import React, { KeyboardEventHandler, useState } from 'react'
import { makeStyles } from '@mui/styles'
import TextInput from '../text-input'
import FormControls from '../form-controls'
import Center from '../center'
import Button from '../button'
import { Login as LoginIcon } from '../../icons'
import { handleError } from '@/error-handling'
import useFirebaseFunction from '@/hooks/useFirebaseFunction'
import { load as loadRecaptcha } from 'recaptcha-v3'
import { auth } from '@/firebase'
import { signInWithCustomToken } from 'firebase/auth'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import { getIsEmailAddress } from '@/utils/email'

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
  spacer: {
    height: '1rem',
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
      backgroundColor: '#C2C2C2 !important',
    },
  },
  twitter: {
    backgroundColor: '#55acee !important',
    '&:hover': {
      backgroundColor: '#4790c7 !important',
    },
  },
})

enum FunctionNames {
  SignUpWithEmail = 'signupWithEmail',
}

interface SignUpUserPayload {
  email: string
  password: string
  recaptchaToken: string
}

enum SignUpErrorCode {
  Unknown = 0,
  // EmailTaken = 1,
  RecaptchaInvalid = 2,
}

interface SignUpUserResult {
  code?: SignUpErrorCode
  token?: string // auth
}

const RECAPTCHA_SITE_KEY = process.env.REACT_APP_RECAPTCHA_SITE_KEY!
const RECAPTCHA_ACTION_NAME = 'signup'

const getRecaptchaToken = async () => {
  console.debug(`getting recaptcha token...`, {
    key: RECAPTCHA_SITE_KEY,
    action: RECAPTCHA_ACTION_NAME,
  })
  const recaptcha = await loadRecaptcha(RECAPTCHA_SITE_KEY)
  const token = await recaptcha.execute(RECAPTCHA_ACTION_NAME)
  console.debug(`got token: ${token}`)
  return token
}

const SignUpWithEmailForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [isWorking, setIsWorking] = useState(false)
  const [usernameVal, setUsernameVal] = useState('')
  const [passwordVal, setPasswordVal] = useState('')
  const classes = useStyles()
  const [isSigningUp, lastErrorCode, lastResult, signupUser] =
    useFirebaseFunction<SignUpUserPayload, SignUpUserResult>(
      FunctionNames.SignUpWithEmail
    )

  const isActuallyWorking = isWorking || isSigningUp

  const submit = async () => {
    try {
      if (!usernameVal || !passwordVal || !getIsEmailAddress(usernameVal))
        return

      console.debug(`signing in with email and password...`, {
        email: usernameVal,
      })

      setIsWorking(true)

      const recaptchaToken = await getRecaptchaToken()

      setIsWorking(false)

      if (!recaptchaToken) throw new Error('Need a recaptcha token')

      // send off to function to verify recaptcha token and perform user creation

      const { code, token } = await signupUser({
        email: usernameVal,
        password: passwordVal,
        recaptchaToken,
      })

      if (code) {
        console.error(`Got code: ${code}`)
        return
      }

      if (!token) {
        throw new Error('Need an auth token')
      }

      const user = await signInWithCustomToken(auth, token)

      console.debug(`signup success`, { email: usernameVal, user })

      onSuccess()
    } catch (err) {
      console.error(err)
      handleError(err)
      setIsWorking(false)
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
              Sign Up
            </Button>
          </Center>
        </div>
      </FormControls>
      {isWorking && <LoadingIndicator message="Signing up..." />}
      {lastErrorCode !== null ? (
        <ErrorMessage>Failed to sign up (code {lastErrorCode})</ErrorMessage>
      ) : null}
      {lastResult !== null && lastResult.code !== undefined ? (
        <ErrorMessage>
          Failed to sign up (result {lastResult.code})
        </ErrorMessage>
      ) : null}
    </form>
  )
}

export default SignUpWithEmailForm
