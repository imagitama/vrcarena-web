import React, { useState } from 'react'
import UserOverview from '../user-overview'
import useUserRecord from '../../hooks/useUserRecord'
import Heading from '../heading'
import { useSelector } from 'react-redux'
import { RootState } from '../../modules'
import FormattedDate from '../formatted-date'
import { FirebaseReducer } from 'react-redux-firebase'
import Avatar from '../avatar'
import UsernameLink from '../username-link'
import Button from '../button'
import {
  EmailAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
  GoogleAuthProvider,
  PhoneAuthProvider,
  TwitterAuthProvider,
} from 'firebase/auth'
import useFirebaseUser from '../../hooks/useFirebaseUser'
import { FirebaseUser } from '../../firebase'

const getSigninMethod = (firebaseUser: FirebaseUser): string => {
  // TODO: someday populate this
  if (!firebaseUser.providerData || !firebaseUser.providerData.length) {
    return 'Discord'
  }

  switch (firebaseUser.providerData[0].providerId) {
    case EmailAuthProvider.PROVIDER_ID:
      return 'Email and password'
    case FacebookAuthProvider.PROVIDER_ID:
      return 'Facebook'
    case GithubAuthProvider.PROVIDER_ID:
      return 'GitHub'
    case GoogleAuthProvider.PROVIDER_ID:
      return 'Google'
    case PhoneAuthProvider.PROVIDER_ID:
      return 'Phone number'
    case TwitterAuthProvider.PROVIDER_ID:
      return 'Twitter'
    default:
      return 'Other'
  }
}

const MyUserOverview = () => {
  const [, , userRecord] = useUserRecord()
  const firebaseUser = useFirebaseUser()
  const [isPrivateInfoRevealed, setIsPrivateInfoRevealed] = useState(false)

  if (!userRecord || !firebaseUser) {
    return null
  }

  console.debug('USER????', firebaseUser)

  return (
    <>
      <Avatar url={userRecord.avatarurl} />
      <Heading variant="h3">
        <UsernameLink username={userRecord.username} id={userRecord.id} />
      </Heading>
      <Heading variant="h1">Sign-up Info</Heading>
      <Heading variant="h2">Email</Heading>
      {!isPrivateInfoRevealed ? (
        <Button
          onClick={() => setIsPrivateInfoRevealed(true)}
          size="small"
          color="secondary">
          Reveal
        </Button>
      ) : (
        `${firebaseUser.email || '(none)'}`
      )}
      <Heading variant="h2">Signed Up</Heading>
      {firebaseUser.metadata && firebaseUser.metadata.creationTime ? (
        <FormattedDate
          date={new Date(firebaseUser.metadata.creationTime)}
          isRelative={false}
        />
      ) : (
        '(not recorded)'
      )}
      <Heading variant="h2">Last Logged In</Heading>
      {firebaseUser.metadata && firebaseUser.metadata.lastSignInTime ? (
        <FormattedDate
          date={new Date(firebaseUser.metadata.lastSignInTime)}
          isRelative={false}
        />
      ) : (
        '(not recorded)'
      )}
      <Heading variant="h2">Method</Heading>
      {getSigninMethod(firebaseUser)}
      <Heading variant="h2">ID</Heading>
      {firebaseUser.uid}
    </>
  )
}

export default MyUserOverview
