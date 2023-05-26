import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Link from '../../components/link'

import * as routes from '../../routes'
import { UserFieldNames } from '../../hooks/useDatabaseQuery'
import { getUserIsStaffMember } from '../../utils/users'

import Avatar, { sizes } from '../avatar'
import StaffBadge from '../staff-badge'

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  item: {
    width: '200px',
    height: '200px',
    textAlign: 'center',
    position: 'relative'
  },
  itemContents: {
    alignItems: 'center'
  },
  icon: {
    display: 'inline-block',
    fontSize: '400%'
  },
  name: {
    display: 'block',
    fontSize: '150%',
    marginTop: '0.5rem'
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%'
  },
  avatar: {
    margin: '0 auto'
  }
})

export default ({ user }) => {
  const classes = useStyles()
  return (
    <div className={classes.item}>
      <Link
        to={routes.viewUserWithVar.replace(':userId', user.id)}
        title={`View the user profile for user ${
          user[UserFieldNames.username]
        }`}
        className={classes.link}>
        <div className={classes.itemContents}>
          <Avatar
            url={
              user && user[UserFieldNames.avatarUrl]
                ? user[UserFieldNames.avatarUrl]
                : null
            }
            size={sizes.SMALL}
            className={classes.avatar}
          />
          <span className={classes.name}>
            {user[UserFieldNames.username] || '(no name set)'}
          </span>
          {getUserIsStaffMember(user) && <StaffBadge />}
        </div>
      </Link>
    </div>
  )
}
