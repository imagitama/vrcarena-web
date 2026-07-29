import React from 'react'
import styled from '@emotion/styled'

import Link from '@/components/link'
import * as routes from '@/routes'

import OriginalAvatar, { AvatarSize } from '@/components/avatar'
import StatusText from '@/components/status-text'

const UserLink = styled(Link)`
  display: inline-flex;
  align-items: first baseline;
  & img {
  }
`

const Avatar = styled(OriginalAvatar)`
  position: relative;
  top: 6px;
  margin: 0 0.25rem;
`

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
  avatarUrl?: string | null
  reputation?: number
}) => (
  <>
    <UserLink
      to={routes.viewUserWithVar.replace(':userId', id)}
      title={username}>
      {avatarUrl && <Avatar url={avatarUrl} size={AvatarSize.ExtraTiny} />}
      {children || username}
    </UserLink>
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
