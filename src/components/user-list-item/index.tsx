import React from 'react'
import { makeStyles } from '@mui/styles'
import Link from '../../components/link'

import * as routes from '../../routes'
import { getUserIsStaffMember } from '../../utils/users'

import Avatar, { AvatarSize } from '../avatar'
import StaffBadge from '../staff-badge'
import { mediaQueryForMobiles } from '../../media-queries'
import { BanStatus, FullUser, User, getIsFullUser } from '../../modules/users'
import { AccessStatus } from '../../modules/common'

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  item: {
    width: '200px',
    height: '200px',
    textAlign: 'center',
    position: 'relative',
    [mediaQueryForMobiles]: {
      width: '150px',
      height: '150px',
    },
  },
  itemContents: {
    alignItems: 'center',
  },
  icon: {
    display: 'inline-block',
    fontSize: '400%',
  },
  name: {
    display: 'block',
    fontSize: '150%',
    marginTop: '0.5rem',
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  avatar: {
    margin: '0 auto',
  },
  isBanned: {
    textDecoration: 'line-through',
  },
  isDeleted: {
    opacity: 0.5,
  },
})

export default ({ user }: { user: FullUser | User }) => {
  const classes = useStyles()
  return (
    <div
      className={`${classes.item} ${
        user.banstatus === BanStatus.Banned ? classes.isBanned : ''
      } ${
        user.accessstatus === AccessStatus.Deleted ? classes.isDeleted : ''
      }`}>
      <Link
        to={routes.viewUserWithVar.replace(':userId', user.id)}
        title={`View the user profile for user ${user.username}`}
        className={classes.link}>
        <div className={classes.itemContents}>
          <Avatar
            url={user && user.avatarurl ? user.avatarurl : undefined}
            size={AvatarSize.Small}
            className={classes.avatar}
          />
          <span className={classes.name}>
            {user.username || '(no name set)'}
          </span>
          {getIsFullUser(user) && getUserIsStaffMember(user) && <StaffBadge />}
        </div>
      </Link>
    </div>
  )
}
