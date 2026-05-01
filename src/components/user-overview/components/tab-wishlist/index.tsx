import React from 'react'
import WishlistForUser from '@/components/wishlist-for-user'
import useUserOverview from '../../useUserOverview'

export default () => {
  const { userId, user } = useUserOverview()

  if (!userId || !user) {
    return null
  }

  return <WishlistForUser userId={userId} />
}
