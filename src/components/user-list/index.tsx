import React from 'react'
import { makeStyles } from '@mui/styles'

import { UserForList } from '@/modules/users'
import UserListItem from '@/components/user-list-item'

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
})

// TODO: rename to UserResults
const UserList = ({ users }: { users?: UserForList[] }) => {
  const classes = useStyles()
  return (
    <div className={classes.container}>
      {users
        ? users.map((user) => <UserListItem key={user.id} user={user} />)
        : null}
    </div>
  )
}

export default UserList
