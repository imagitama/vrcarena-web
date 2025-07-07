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

const getSigninMethod = (firebaseUser: FirebaseReducer.AuthState): string => {
  if (!firebaseUser.providerData || !firebaseUser.providerData.length) {
    return 'Unknown'
  }

  switch (firebaseUser.providerData[0].providerId) {
    case 'password':
      return 'Email and password'
    default:
      return 'External (Google, Discord, etc.)'
  }
}

const MyUserOverview = () => {
  const [, , userRecord] = useUserRecord()
  const { firebase } = useSelector<
    RootState,
    { firebase: RootState['firebase'] }
  >(({ firebase }) => ({
    firebase,
  }))
  const [isPrivateInfoRevealed, setIsPrivateInfoRevealed] = useState(false)

  if (!userRecord) {
    return null
  }

  const firebaseUser = firebase.auth

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
      <FormattedDate
        date={new Date(parseInt(firebaseUser.createdAt))}
        isRelative={false}
      />
      <Heading variant="h2">Last Logged In</Heading>
      <FormattedDate
        date={new Date(parseInt(firebaseUser.lastLoginAt))}
        isRelative={false}
      />
      <Heading variant="h2">Method</Heading>
      {getSigninMethod(firebaseUser)}
      <Heading variant="h2">ID</Heading>
      {firebaseUser.uid}
    </>
  )
}

export default MyUserOverview
