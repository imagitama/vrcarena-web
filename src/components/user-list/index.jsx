import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import UserListItem from '../user-list-item'

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexWrap: 'wrap'
  }
})

export default ({ users }) => {
  const classes = useStyles()
  return (
    <div className={classes.container}>
      {users.map(user => (
        <UserListItem key={user.id} user={user} />
      ))}
    </div>
  )
}
