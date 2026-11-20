import React, { useState } from 'react'

import useUserRecord from '@/hooks/useUserRecord'

import Heading from '@/components/heading'
import FormattedDate from '@/components/formatted-date'
import Avatar from '@/components/avatar'
import UsernameLink from '@/components/username-link'
import Button from '@/components/button'
import {
  getHasUserVerifiedTheirEmail,
  getSignedUpWithDiscord,
  getSignedUpWithEmail,
  loggedInUser,
} from '@/auth'

const MyUserOverview = () => {
  const [, , user] = useUserRecord()
  const [isPrivateInfoRevealed, setIsPrivateInfoRevealed] = useState(false)

  if (!user) {
    return null
  }

  return (
    <>
      {user.avatarurl && <Avatar url={user.avatarurl} />}
      <Heading variant="h1" style={{ marginTop: '0.5rem' }}>
        <UsernameLink username={user.username} id={user.id} />
      </Heading>
      <Heading variant="h2">Sign-up Method</Heading>
      {getSignedUpWithEmail(loggedInUser!)
        ? 'Email'
        : getSignedUpWithDiscord(loggedInUser!)
        ? 'Discord'
        : 'Unknown'}
      <Heading variant="h2">Email</Heading>
      {isPrivateInfoRevealed ? (
        loggedInUser!.email!
      ) : (
        <Button
          onClick={() => setIsPrivateInfoRevealed(true)}
          color="secondary"
          size="small">
          Reveal
        </Button>
      )}
    </>
  )
}

export default MyUserOverview
