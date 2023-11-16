import React from 'react'
import { Helmet } from 'react-helmet'

import SetupProfile from '../../components/setup-profile'
import NotLoggedInMessage from '../../components/not-logged-in-message'
import LoadingIndicator from '../../components/loading-indicator'
import * as routes from '../../routes'
import useHistory from '../../hooks/useHistory'
import useIsLoggedIn from '../../hooks/useIsLoggedIn'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'

const View = () => {
  const firebaseUserId = useFirebaseUserId()
  const isLoggedIn = useIsLoggedIn()
  const { push } = useHistory()

  if (!isLoggedIn) {
    if (firebaseUserId) {
      return <LoadingIndicator message="Preparing your account..." />
    } else {
      return <NotLoggedInMessage />
    }
  }

  return (
    <SetupProfile
      analyticsCategory="Setup Profile"
      onDone={() => push(routes.home)}
    />
  )
}

export default () => (
  <>
    <Helmet>
      <title>Setup your profile | VRCArena</title>
      <meta
        name="description"
        content="Use this form to setup your profile with basic settings."
      />
    </Helmet>
    <View />
  </>
)
