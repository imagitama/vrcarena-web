import React from 'react'
import { makeStyles } from '@mui/styles'

import { FullUser, User } from '@/modules/users'
import UserListItem from '@/components/user-list-item'

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
})

export default ({ users }: { users?: (FullUser | User)[] }) => {
  const classes = useStyles()
  return (
    <div className={classes.container}>
      {users
        ? users.map((user) => <UserListItem key={user.id} user={user} />)
        : null}
    </div>
  )
}
