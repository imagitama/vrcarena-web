import React from 'react'
import { useParams } from 'react-router'
import { Helmet } from 'react-helmet'

import Heading from '../../components/heading'
import ErrorMessage from '../../components/error-message'
import NoPermissionMessage from '../../components/no-permission-message'
import AmendmentEditor from '../../components/amendment-editor'

import useUserRecord from '../../hooks/useUserRecord'
import useNotices from '../../hooks/useNotices'
import InfoMessage from '../../components/info-message'
import * as routes from '../../routes'
import { CollectionNames } from '../../modules/assets'

const noticeId = 'create-amendment-info'

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
  const [, , user] = useUserRecord()
  const [hiddenNotices, hideNotice] = useNotices()

  if (!parentTable || !parentId) {
    return <ErrorMessage>Must provide a parent</ErrorMessage>
  }

  if (!user) {
    return <NoPermissionMessage />
  }

  return (
    <>
      <Heading variant="h1">Create Amendment</Heading>
      {!hiddenNotices.includes(noticeId) && (
        <InfoMessage onOkay={() => hideNotice(noticeId)}>
          Use this form to amend an existing record. Our staff members will
          review your amendment usually within 48 hours.
        </InfoMessage>
      )}
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
