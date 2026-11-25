import React, { useState } from 'react'

import useUserRecord from '@/hooks/useUserRecord'

import Heading from '@/components/heading'
import FormattedDate from '@/components/formatted-date'
import Avatar from '@/components/avatar'
import UsernameLink from '@/components/username-link'
import Button from '@/components/button'
import { getSignUpMethod, loggedInUser } from '@/auth'
import useSupabaseUser from '@/hooks/useSupabaseUser'
import { capitalize } from '@/utils'

const MyUserOverview = () => {
  const [, , user] = useUserRecord()
  const supabaseUser = useSupabaseUser()
  const [isPrivateInfoRevealed, setIsPrivateInfoRevealed] = useState(false)

  if (!user || !supabaseUser) {
    return null
  }

  return (
    <>
      {user.avatarurl && <Avatar url={user.avatarurl} />}
      <Heading variant="h1" style={{ marginTop: '0.5rem' }}>
        <UsernameLink username={user.username} id={user.id} />
      </Heading>
      <Heading variant="h2">Sign-up Method</Heading>
      {capitalize(getSignUpMethod(supabaseUser) || 'unknown')}
      {loggedInUser?.email ? (
        <>
          <Heading variant="h2">Email</Heading>
          {isPrivateInfoRevealed ? (
            loggedInUser!.email
          ) : (
            <Button
              onClick={() => setIsPrivateInfoRevealed(true)}
              color="secondary"
              size="small">
              Reveal
            </Button>
          )}
        </>
      ) : null}
    </>
  )
}

export default MyUserOverview
