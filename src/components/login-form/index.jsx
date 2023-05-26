import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'
import firebase from 'firebase/app'

import { auth as authInstance } from '../../firebase'
import { trackAction } from '../../analytics'
import LoginWithDiscordBtn from '../login-with-discord-btn'

const loginWithDiscordUrl = `https://discord.com/api/oauth2/authorize?client_id=${
  process.env.REACT_APP_DISCORD_CLIENT_ID
}&redirect_uri=${
  process.env.REACT_APP_DISCORD_REDIRECT_URI
}&response_type=code&scope=identify%20email&prompt=none`

const useStyles = makeStyles({
  loginWithDiscordWrapper: {
    textAlign: 'center',
    marginBottom: '1rem'
  }
})

export default ({ onSuccess }) => {
  const classes = useStyles()

  const uiConfig = {
    signInFlow: 'popup',
    callbacks: {
      signInSuccessWithAuthResult: onSuccess
    },
    signInOptions: [
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.TwitterAuthProvider.PROVIDER_ID
    ],
    credentialHelper: 'none' // disable redirect on email login
  }

  return (
    <>
      {loginWithDiscordUrl && (
        <div className={classes.loginWithDiscordWrapper}>
          <LoginWithDiscordBtn
            url={loginWithDiscordUrl}
            openInNewTab={false}
            onClick={() =>
              trackAction('Login', 'Click login with Discord button')
            }
          />
        </div>
      )}
      <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={authInstance} />
    </>
  )
}
