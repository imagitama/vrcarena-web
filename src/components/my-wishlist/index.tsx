import React from 'react'

import useUserId from '@/hooks/useUserId'
import WishlistForUser from '@/components/wishlist-for-user'
import NoPermissionMessage from '@/components/no-permission-message'

const MyWishlist = () => {
  const userId = useUserId()

  if (!userId) {
    return <NoPermissionMessage />
  }

  return <WishlistForUser userId={userId} />
}

export default MyWishlist
