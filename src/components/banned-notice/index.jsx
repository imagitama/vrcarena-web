import React from 'react'
import useUserRecord from '../../hooks/useUserRecord'
import Paper from '../paper'
import { UserFieldNames } from '../../hooks/useDatabaseQuery'

export default () => {
  const [, , user] = useUserRecord()

  if (user && user[UserFieldNames.isBanned]) {
    return (
      <Paper>
        <strong>Your account has been disabled.</strong>
        <p>
          You will not be able to perform any actions on the site including
          commenting and posting assets.
        </p>
        <p>Ban reason: {user[UserFieldNames.banReason] || '(none)'}</p>
      </Paper>
    )
  }

  return null
}
