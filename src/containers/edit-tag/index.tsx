import React from 'react'
import { useParams } from 'react-router'
import { Helmet } from '@unhead/react/helmet'

import * as routes from '@/routes'
import { CollectionNames, editableFields } from '@/modules/tags'

import usePermissions from '@/hooks/usePermissions'

import GenericEditor from '@/components/generic-editor'
import Heading from '@/components/heading'
import NoPermissionMessage from '@/components/no-permission-message'

const View = () => {
  const { tag } = useParams<{ tag?: string }>()
  const isCreating = !tag

  if (!usePermissions(routes.editTagWithVar)) {
    return <NoPermissionMessage />
  }

  return (
    <>
      <Heading variant="h1">{isCreating ? 'Create' : 'Edit'} Tag</Heading>
      <GenericEditor
        fields={editableFields}
        collectionName={CollectionNames.Tags}
        id={tag}
        analyticsCategory={`${tag ? 'Edit' : 'Create'}Tag`}
        getSuccessUrl={(newTag) =>
          routes.viewTagWithVar.replace(':tag', newTag || tag || 'fail')
        }
        cancelUrl={
          tag ? routes.viewTagWithVar.replace(':tag', tag) : routes.tags
        }
      />
    </>
  )
}

export default () => {
  const { tag } = useParams<{ tag?: string }>()
  const isCreating = !tag

  return (
    <>
      <Helmet>
        <title>{isCreating ? 'Create' : 'Edit'} tag</title>
        <meta
          name="description"
          content={`Use this form to ${isCreating ? 'create' : 'edit'} a tag.`}
        />
      </Helmet>
      <View />
    </>
  )
}
