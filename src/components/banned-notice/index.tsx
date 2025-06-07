import React from 'react'
import useUserRecord from '../../hooks/useUserRecord'
import Paper from '../paper'
import { BanStatus, FullUser } from '../../modules/users'

const getIsUserBanned = (user: FullUser): boolean =>
  user.banstatus === BanStatus.Banned

const BannedNotice = () => {
  const [, , user] = useUserRecord()

  if (user && getIsUserBanned(user)) {
    return (
      <Paper>
        <strong>Your account has been disabled.</strong>
        <p>
          You will not be able to perform any actions on the site including
          commenting and posting assets.
        </p>
        <p>Ban reason: {user.banreason || '(none)'}</p>
      </Paper>
    )
  }

  return null
}

export default BannedNotice
