import React from 'react'
import useUserRecord from '../../hooks/useUserRecord'
import { getIsUserBanned } from '../../utils/users'
import ErrorMessage from '../error-message'

const BannedNotice = () => {
  const [, , user] = useUserRecord()

  if (user && getIsUserBanned(user)) {
    return (
      <ErrorMessage title="Your account has been banned">
        You will not be able to perform any actions on the site including
        commenting and posting assets.
        <br />
        <br />
        <strong>Reason: {user.banreason || '(none)'}</strong>
        <br />
        <br />
      </ErrorMessage>
    )
  }

  return null
}

export default BannedNotice
