import React from 'react'

import useUserId from '../../hooks/useUserId'
import WishlistForUser from '../wishlist-for-user'
import NoPermissionMessage from '../no-permission-message'

export default () => {
  const userId = useUserId()

  if (!userId) {
    return <NoPermissionMessage />
  }

  return <WishlistForUser userId={userId} />
}
