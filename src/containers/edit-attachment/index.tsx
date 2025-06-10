import React from 'react'
import { useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet'

import GenericEditor from '../../components/generic-editor'
import Heading from '../../components/heading'

import { CollectionNames } from '../../modules/attachments'

import * as routes from '../../routes'
import useIsLoggedIn from '../../hooks/useIsLoggedIn'
import NoPermissionMessage from '../../components/no-permission-message'

const View = () => {
  const { attachmentId } = useParams<{ attachmentId: string }>()
  const isCreating = !attachmentId || attachmentId === 'create'

  return (
    <>
      <Heading variant="h1">
        {isCreating ? 'Create' : 'Edit'} Attachment
      </Heading>
      <GenericEditor
        collectionName={CollectionNames.Attachments}
        id={isCreating ? undefined : attachmentId}
        analyticsCategory={isCreating ? 'CreateAttachment' : 'EditAttachment'}
        saveBtnAction="Click save attachment button"
        viewBtnAction="Click view item button after save"
        cancelBtnAction="Click cancel button"
        successUrl={routes.viewAttachmentWithVar.replace(
          ':attachmentId',
          attachmentId
        )}
        getSuccessUrl={(newId) =>
          routes.viewAttachmentWithVar.replace(
            ':attachmentId',
            newId || attachmentId
          )
        }
      />
    </>
  )
}

const EditAttachmentContainer = () => {
  const { attachmentId } = useParams<{ attachmentId: string }>()
  const isLoggedIn = useIsLoggedIn()

  const isCreating = !attachmentId || attachmentId === 'create'

  if (!isLoggedIn) {
    return <NoPermissionMessage />
  }

  return (
    <>
      <Helmet>
        <title>{isCreating ? 'Create' : 'Edit'} an attachment | VRCArena</title>
        <meta
          name="description"
          content={`Use this form to ${
            isCreating ? 'create' : 'edit'
          } an attachment.`}
        />
      </Helmet>
      <View />
    </>
  )
}

export default EditAttachmentContainer
