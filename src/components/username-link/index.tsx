import React from 'react'
import Link from '../../components/link'
import * as routes from '../../routes'
import Avatar, { AvatarSize } from '../avatar'
import StatusText from '../status-text'

export default ({
  id,
  username,
  children,
  avatarUrl,
  reputation,
}: {
  id: string
  username?: string
  children?: React.ReactNode
  avatarUrl?: string
  reputation?: number
}) => (
  <>
    <Link to={routes.viewUserWithVar.replace(':userId', id)} title={username}>
      {avatarUrl && <Avatar url={avatarUrl} size={AvatarSize.Tiny} />}
      {children || username}
    </Link>
    {reputation !== undefined ? (
      <>
        {' '}
        (
        <Link
          to={routes.viewUserWithVarAndTabVar
            .replace(':userId', id)
            .replace(':tabName', 'reputation')}
          title="User Reputation">
          <StatusText positivity={reputation > 0 ? 1 : -1}>
            {reputation}
          </StatusText>
        </Link>
        )
      </>
    ) : null}
  </>
)
