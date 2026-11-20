import React, { KeyboardEventHandler, useState } from 'react'
import { makeStyles } from '@mui/styles'

import { Login as LoginIcon } from '@/icons'
import { handleError } from '@/error-handling'
import { getIsEmailAddress } from '@/utils/email'
import { mediaQueryForMobiles } from '@/media-queries'

import useSupabaseFunction from '@/hooks/useSupabaseFunction'

import TextInput from '@/components/text-input'
import FormControls from '@/components/form-controls'
import Center from '@/components/center'
import Button from '@/components/button'
import LoadingIndicator from '@/components/loading-indicator'
import ErrorMessage from '@/components/error-message'
import { signup } from '@/auth'
import SuccessMessage from '../success-message'
import { routes } from '@/routes'
import { AuthApiError, AuthError } from '@supabase/supabase-js'

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
  // codes
  InvalidEmail = 11,
  InvalidPassword = 12,
  WeakPassword = 13,
  EmailAlreadyInUse = 14,
}

interface SignUpUserResult {
  code?: SignUpErrorCode
  token?: string // auth token
}

const RECAPTCHA_SITE_KEY = process.env.REACT_APP_RECAPTCHA_SITE_KEY!
const RECAPTCHA_ACTION_NAME = 'signup'

const getRecaptchaToken = async () => {
  const { load: loadRecaptcha } = await import('recaptcha-v3')
  const recaptcha = await loadRecaptcha(RECAPTCHA_SITE_KEY)
  const token = await recaptcha.execute(RECAPTCHA_ACTION_NAME)
  return token
}

const getErrorCodeFromError = (err: Error): string => {
  if (err instanceof AuthApiError) {
    return err.code!
  }
  return 'unknown'
}

type AuthErrorCode = AuthError['code']

const getUserFriendlyMessageFromCode = (code: AuthErrorCode): string => {
  switch (code!) {
    case 'user_already_exists':
      return 'user already exists'
  }
  return code as string
}

const SignUpWithEmailForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [isWorking, setIsWorking] = useState(false)
  const [usernameVal, setUsernameVal] = useState('')
  const [passwordVal, setPasswordVal] = useState('')
  const classes = useStyles()

  const [isSuccess, setIsSuccess] = useState<boolean | null>(null)
  const [lastResult, setLastResult] = useState<null>(null)
  const [lastErrorCode, setLastErrorCode] = useState<null | string>(null)

  const submit = async () => {
    try {
      if (!usernameVal || !passwordVal || !getIsEmailAddress(usernameVal))
        return

      console.debug(`signing in with email and password...`, {
        email: usernameVal,
      })

      setIsWorking(true)
      setIsSuccess(null)

      // const recaptchaToken = await getRecaptchaToken()

      setIsWorking(false)

      // if (!recaptchaToken) throw new Error('Need a recaptcha token')

      await signup(usernameVal, passwordVal)

      // onSuccess()

      setIsSuccess(true)
    } catch (err) {
      console.error(err)
      handleError(err)
      setIsWorking(false)
      setIsSuccess(false)
      setLastErrorCode(getErrorCodeFromError(err as Error))
    }
  }

  const onKeyDown: KeyboardEventHandler = (e) => {
    if (e.key == 'Enter') {
      console.debug(`user pressed enter, submitting...`)
      submit()
    }
  }

  if (isSuccess !== null) {
    if (isSuccess) {
      return (
        <SuccessMessage>
          You have signed up successfully.
          <br />
          <br />
          <strong>
            You must now verify your email address and login again.
          </strong>
          <br />
          <br />
          <FormControls>
            <Button url={routes.login} color="secondary">
              Go To Login
            </Button>
          </FormControls>
        </SuccessMessage>
      )
    } else {
      return (
        <ErrorMessage>
          Signup failed:{' '}
          {lastErrorCode
            ? getUserFriendlyMessageFromCode(lastErrorCode)
            : 'unknown'}
        </ErrorMessage>
      )
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
        autoComplete="email"
      />
      <TextInput
        topMargin
        fullWidth
        value={passwordVal}
        onChange={(e) => setPasswordVal(e.target.value)}
        label="Password"
        type="password"
        onKeyDown={onKeyDown}
        autoComplete="new-password"
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
        <ErrorMessage errorCode={lastErrorCode}>Failed to sign up</ErrorMessage>
      ) : null}
      {/* {lastResult !== null && lastResult.code !== undefined ? (
        <ErrorMessage>
          Failed to sign up: {getLabelForSignUpErrorCode(lastResult.code)}
        </ErrorMessage>
      ) : null} */}
    </form>
  )
}

export default SignUpWithEmailForm
