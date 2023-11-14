import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

import UsernameLink from '../username-link'
import Avatar from '../avatar'

const useStyles = makeStyles({
  root: {
    border: '1px solid rgba(255, 255, 255, 0.1)',
    '& > a': {
      padding: '0.5rem',
      display: 'flex',
      alignItems: 'center'
    }
  }
})

const UserBadge = ({
  username,
  id,
  avatarUrl
}: {
  username: string
  id: string
  avatarUrl: string
}) => {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      <UsernameLink username={username} id={id}>
        <Avatar url={avatarUrl} /> {username}
      </UsernameLink>
    </div>
  )
}

export default UserBadge
