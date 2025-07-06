import React from 'react'
import { useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet'

import GenericEditor from '../../components/generic-editor'
import Heading from '../../components/heading'

import { CollectionNames, ViewNames } from '../../modules/collections'

import * as routes from '../../routes'
import NoPermissionMessage from '../../components/no-permission-message'
import usePermissions from '../../hooks/usePermissions'

const View = () => {
  const { collectionId } = useParams<{ collectionId: string }>()
  const isCreating = !collectionId || collectionId === 'create'

  if (!usePermissions(routes.editCollectionWithVar)) {
    return <NoPermissionMessage />
  }

  return (
    <>
      <Heading variant="h1">
        {isCreating ? 'Create' : 'Edit'} Collection
      </Heading>
      <GenericEditor
        viewName={ViewNames.GetFullCollections}
        collectionName={CollectionNames.Collections}
        id={isCreating ? undefined : collectionId}
        analyticsCategory={isCreating ? 'CreateCollection' : 'EditCollection'}
        saveBtnAction="Click save collection button"
        viewBtnAction="Click view item button after save"
        cancelBtnAction="Click cancel button"
        successUrl={routes.viewCollectionWithVar.replace(
          ':collectionId',
          collectionId
        )}
        getSuccessUrl={(newId) =>
          routes.viewCollectionWithVar.replace(
            ':collectionId',
            newId || collectionId
          )
        }
        cancelUrl={
          isCreating
            ? routes.viewCollections
            : routes.viewCollectionWithVar.replace(
                ':collectionId',
                collectionId
              )
        }
      />
    </>
  )
}

export default () => {
  const { collectionId } = useParams<{ collectionId: string }>()
  const isCreating = !collectionId || collectionId === 'create'

  return (
    <>
      <Helmet>
        <title>{isCreating ? 'Create' : 'Edit'} collection | VRCArena</title>
        <meta
          name="description"
          content={`Use this form to ${
            isCreating ? 'create' : 'edit'
          } an collection.`}
        />
      </Helmet>
      <View />
    </>
  )
}
