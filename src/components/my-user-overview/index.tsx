import React from 'react'
import UserOverview from '../user-overview'
import useUserRecord from '../../hooks/useUserRecord'
import Heading from '../heading'
import { useSelector } from 'react-redux'
import { RootState } from '../../modules'
import FormattedDate from '../formatted-date'
import { FirebaseReducer } from 'react-redux-firebase'

const getSigninMethod = (firebaseUser: FirebaseReducer.AuthState): string => {
  if (!firebaseUser.providerData) {
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

  if (!userRecord) {
    return null
  }

  const firebaseUser = firebase.auth

  console.debug('auth', firebaseUser)

  return (
    <>
      <UserOverview user={userRecord} small />
      <Heading variant="h1">Sign-up Info</Heading>
      <Heading variant="h2">Email</Heading>
      {firebaseUser.email || '(none)'}
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
