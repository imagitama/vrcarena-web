import React from 'react'
import { makeStyles } from '@mui/styles'
import UserListItem from '../user-list-item'
import { FullUser, User } from '../../modules/users'

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
