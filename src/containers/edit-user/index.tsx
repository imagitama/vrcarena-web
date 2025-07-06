import React from 'react'
import { useParams } from 'react-router'
import { Helmet } from 'react-helmet'

import GenericEditor from '../../components/generic-editor'
import Heading from '../../components/heading'
import NoPermissionMessage from '../../components/no-permission-message'
import * as routes from '../../routes'
import { CollectionNames } from '../../modules/users'
import useIsEditor from '../../hooks/useIsEditor'
import usePermissions from '../../hooks/usePermissions'

const View = () => {
  const { userId } = useParams<{ userId: string }>()

  if (!usePermissions(routes.editUserWithVar)) {
    return <NoPermissionMessage />
  }

  return (
    <>
      <Heading variant="h1">Edit User</Heading>
      <GenericEditor
        collectionName={CollectionNames.Users}
        id={userId}
        analyticsCategory="EditUser"
        saveBtnAction="Click save button"
        viewBtnAction="Click view item button after save"
        cancelBtnAction="Click cancel button"
        successUrl={routes.viewUserWithVar.replace(':userId', userId)}
        cancelUrl={routes.viewUserWithVar.replace(':userId', userId)}
        extraFormData={{
          userId,
        }}
      />
      <Heading variant="h1">Edit Meta</Heading>
      <GenericEditor
        collectionName={CollectionNames.UsersMeta}
        id={userId}
        analyticsCategory="EditUserMeta"
        saveBtnAction="Click save button"
        viewBtnAction="Click view item button after save"
        cancelBtnAction="Click cancel button"
        successUrl={routes.viewUserWithVar.replace(':userId', userId)}
        cancelUrl={routes.viewUserWithVar.replace(':userId', userId)}
        extraFormData={{
          userId,
        }}
      />
    </>
  )
}

export default () => (
  <>
    <Helmet>
      <title>Edit a user | VRCArena</title>
      <meta name="description" content="Use this form to edit a user." />
    </Helmet>
    <View />
  </>
)
