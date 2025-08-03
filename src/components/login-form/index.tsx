import React from 'react'
import { makeStyles } from '@mui/styles'
import { auth as authInstance } from '../../firebase'
import { trackAction } from '../../analytics'
import LoginWithDiscordBtn from '../login-with-discord-btn'
import {
  EmailAuthProvider,
  GoogleAuthProvider,
  TwitterAuthProvider,
} from 'firebase/auth'
import StyledFirebaseAuth from './StyledFirebaseAuth'

const loginWithDiscordUrl = `https://discord.com/api/oauth2/authorize?client_id=${process.env.REACT_APP_DISCORD_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_DISCORD_REDIRECT_URI}&response_type=code&scope=identify%20email&prompt=none`

const useStyles = makeStyles({
  loginWithDiscordWrapper: {
    textAlign: 'center',
    marginBottom: '1rem',
  },
})

const LoginForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const classes = useStyles()

  const uiConfig: firebaseui.auth.Config = {
    signInFlow: 'popup',
    callbacks: {
      signInSuccessWithAuthResult: () => {
        onSuccess()
        return false // prevent redirect
      },
    },
    signInOptions: [
      {
        provider: EmailAuthProvider.PROVIDER_ID,
        requireDisplayName: false,
      },
      GoogleAuthProvider.PROVIDER_ID,
      TwitterAuthProvider.PROVIDER_ID,
    ],
    credentialHelper: 'none', // disable redirect on email login
  }

  return (
    <>
      <div className={classes.loginWithDiscordWrapper}>
        <LoginWithDiscordBtn
          url={loginWithDiscordUrl}
          openInNewTab={false}
          onClick={() =>
            trackAction('Login', 'Click login with Discord button')
          }
        />
      </div>
      <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={authInstance} />
    </>
  )
}

export default LoginForm
