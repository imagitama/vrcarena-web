import React from 'react'
import Link from '../../components/link'
import * as routes from '../../routes'
import Avatar, { AvatarSize } from '../avatar'

export default ({
  id,
  username,
  children,
  avatarUrl,
}: {
  id: string
  username?: string
  children?: React.ReactNode
  avatarUrl?: string
}) => (
  <Link to={routes.viewUserWithVar.replace(':userId', id)} title={username}>
    {avatarUrl && <Avatar url={avatarUrl} size={AvatarSize.Tiny} />}
    {children || username}
  </Link>
)
