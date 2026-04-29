import React, { useState } from 'react'
import {
  EmailAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
  GoogleAuthProvider,
  PhoneAuthProvider,
  TwitterAuthProvider,
} from 'firebase/auth'

import useUserRecord from '@/hooks/useUserRecord'
import useFirebaseUser from '@/hooks/useFirebaseUser'
import { FirebaseUser } from '@/firebase'

import Heading from '@/components/heading'
import FormattedDate from '@/components/formatted-date'
import Avatar from '@/components/avatar'
import UsernameLink from '@/components/username-link'
import Button from '@/components/button'

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

  return (
    <>
      <Avatar url={userRecord.avatarurl} />
      <Heading variant="h1">
        <UsernameLink username={userRecord.username} id={userRecord.id} />
      </Heading>
      <Heading variant="h2">Email</Heading>
      {!isPrivateInfoRevealed ? (
        <Button
          onClick={() => setIsPrivateInfoRevealed(true)}
          size="small"
          color="secondary">
          Reveal Email
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
