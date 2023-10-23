import React from 'react'
import { useParams } from 'react-router'
import { Helmet } from 'react-helmet'

import GenericEditor from '../../components/generic-editor'
import Heading from '../../components/heading'
import * as routes from '../../routes'
import { CollectionNames, editableFields } from '../../modules/tags'

export default () => {
  const { tag } = useParams<{ tag?: string }>()
  const isCreating = !tag

  return (
    <>
      <Helmet>
        <title>{isCreating ? 'Create' : 'Edit'} tag | VRCArena</title>
        <meta
          name="description"
          content={`Use this form to ${isCreating ? 'create' : 'edit'} a tag.`}
        />
      </Helmet>
      <Heading variant="h1">{isCreating ? 'Create' : 'Edit'} Tag</Heading>
      <GenericEditor
        fields={editableFields}
        collectionName={CollectionNames.Tags}
        id={tag}
        analyticsCategory={`${tag ? 'Edit' : 'Create'}Tag`}
        getSuccessUrl={newTag =>
          routes.viewTagWithVar.replace(':tag', newTag || tag || 'fail')
        }
        cancelUrl={
          tag ? routes.viewTagWithVar.replace(':tag', tag) : routes.tags
        }
      />
    </>
  )
}
