import React from 'react'
import { makeStyles } from '@mui/styles'

import * as routes from '@/routes'
import { getIsUserBanned, getUserIsStaffMember } from '@/utils/users'
import { mediaQueryForMobiles } from '@/media-queries'
import { BanStatus, UserForList } from '@/modules/users'
import { AccessStatus } from '@/modules/common'

import Link from '@/components/link'
import Avatar, { AvatarSize } from '@/components/avatar'
import { BannedBadge, StaffBadge } from '@/components/badge'
import HintText from '../hint-text'
import FormattedDate from '../formatted-date'

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
  meta: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  isUnallowed: {
    textDecoration: 'line-through',
  },
})

const UserListItem = ({ user }: { user: UserForList }) => {
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
          <span
            className={`${classes.name} ${
              getIsUserBanned(user) ? classes.isUnallowed : ''
            }`}>
            {user.username || '(no name set)'}
          </span>
          <div className={classes.meta}>
            {user.createdat && (
              <HintText small>
                <FormattedDate date={user.createdat} />
              </HintText>
            )}
            {getUserIsStaffMember(user) && <StaffBadge isSmall />}
            {getIsUserBanned(user) && <BannedBadge isSmall />}
          </div>
        </div>
      </Link>
    </div>
  )
}

export default UserListItem
