import React from 'react'
import CollectionForUser from '../../../collection-for-user'
import useUserOverview from '../../useUserOverview'

export default () => {
  const { userId, user } = useUserOverview()

  if (!userId || !user) {
    return null
  }

  return <CollectionForUser userId={userId} />
}
