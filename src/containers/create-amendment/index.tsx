import React from 'react'
import { useParams } from 'react-router'
import { Helmet } from 'react-helmet'

import Heading from '../../components/heading'
import ErrorMessage from '../../components/error-message'
import NoPermissionMessage from '../../components/no-permission-message'
import AmendmentEditor from '../../components/amendment-editor'

import useNotices from '../../hooks/useNotices'
import InfoMessage from '../../components/info-message'
import * as routes from '../../routes'
import { CollectionNames } from '../../modules/assets'
import usePermissions from '../../hooks/usePermissions'

const getReturnUrl = (parentTable: string, parentId: string): string => {
  switch (parentTable) {
    case CollectionNames.Assets:
      return routes.viewAssetWithVar.replace(':assetId', parentId)
    default:
      return ''
  }
}

const View = () => {
  const { parentTable, parentId } = useParams<{
    parentTable: string
    parentId: string
  }>()
  const [hiddenNotices, hideNotice] = useNotices()

  if (!usePermissions(routes.createReportWithVar)) {
    return <NoPermissionMessage />
  }

  if (!parentTable || !parentId) {
    return <ErrorMessage>You must provide a parent and ID</ErrorMessage>
  }

  return (
    <>
      <Heading variant="h1">Create Amendment</Heading>
      <InfoMessage hideId="create-amendment-info">
        Use this form to amend an existing record. Our staff members will review
        your amendment usually within 48 hours. If it takes longer please open a
        ticket in our Discord.
      </InfoMessage>
      <AmendmentEditor
        parentTable={parentTable}
        parentId={parentId}
        returnUrl={getReturnUrl(parentTable, parentId)}
      />
    </>
  )
}

export default () => (
  <>
    <Helmet>
      <title>Create an amendment | VRCArena</title>
      <meta
        name="description"
        content="Complete and submit the amendment form to amend an existing item with changes."
      />
    </Helmet>
    <View />
  </>
)
