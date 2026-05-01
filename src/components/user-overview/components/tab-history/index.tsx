import React from 'react'

import { CollectionNames } from '@/modules/users'
import useIsEditor from '@/hooks/useIsEditor'
import AdminHistory from '@/components/admin-history'
import useUserOverview from '../../useUserOverview'

export default () => {
  const { userId, user } = useUserOverview()
  const isEditor = useIsEditor()

  if (!isEditor || !userId || !user) {
    return null
  }

  return (
    <AdminHistory
      id={userId}
      type={CollectionNames.Users}
      metaType={CollectionNames.UsersMeta}
    />
  )
}
