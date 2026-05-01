import React from 'react'

import EndorsementsForUser from '@/components/endorsements-for-user'

import useUserOverview from '../../useUserOverview'

export default () => {
  const { userId, user } = useUserOverview()

  if (!userId || !user) {
    return null
  }

  return <EndorsementsForUser userId={userId} />
}
