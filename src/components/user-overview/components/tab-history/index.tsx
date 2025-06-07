import React from 'react'
import useUserOverview from '../../useUserOverview'
import useIsEditor from '../../../../hooks/useIsEditor'
import AdminHistory from '../../../admin-history'
import { CollectionNames } from '../../../../modules/users'

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
