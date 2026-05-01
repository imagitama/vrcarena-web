import React from 'react'

import { CollectionNames } from '@/modules/users'
import useIsEditor from '@/hooks/useIsEditor'
import AdminGenericHistory from '@/components/admin-generic-history'
import useUserOverview from '../../useUserOverview'

export default () => {
  const { userId, user } = useUserOverview()
  const isEditor = useIsEditor()

  if (!isEditor || !userId || !user) {
    return null
  }

  return (
    <AdminGenericHistory
      id={userId}
      type={CollectionNames.Users}
      metaType={CollectionNames.UsersMeta}
    />
  )
}
