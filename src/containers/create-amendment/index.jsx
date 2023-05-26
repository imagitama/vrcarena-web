import React from 'react'
import { useParams } from 'react-router'
import { Helmet } from 'react-helmet'

import Heading from '../../components/heading'
import ErrorMessage from '../../components/error-message'
import NoPermissionMessage from '../../components/no-permission-message'
import Message from '../../components/message'
import AmendmentEditor from '../../components/amendment-editor'

import useUserRecord from '../../hooks/useUserRecord'

const View = () => {
  const { parentTable, parentId } = useParams()
  const [, , user] = useUserRecord()

  if (!parentTable || !parentId) {
    return <ErrorMessage>Must provide a parent</ErrorMessage>
  }

  if (!user) {
    return <NoPermissionMessage />
  }

  return (
    <>
      <Heading variant="h1">Create Amendment</Heading>
      <Message>
        Use this form to "amend" an asset or author. A staff member will review
        your amendment and will either apply your changes or reject them for
        whatever reason.
      </Message>
      <AmendmentEditor parentTable={parentTable} parentId={parentId} />
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
