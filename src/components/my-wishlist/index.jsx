import React from 'react'

import useUserId from '../../hooks/useUserId'
import WishlistForUser from '../wishlist-for-user'

export default () => {
  const userId = useUserId()
  return <WishlistForUser userId={userId} />
}
