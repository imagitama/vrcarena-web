import React from 'react'
import { useParams } from 'react-router'
import { Helmet } from 'react-helmet'

import GenericEditor from '../../components/generic-editor'
import Heading from '../../components/heading'
import NoPermissionMessage from '../../components/no-permission-message'
import * as routes from '../../routes'
import { CollectionNames, editableFields } from '../../modules/species'
import usePermissions from '../../hooks/usePermissions'

const View = () => {
  const { speciesId } = useParams<{ speciesId: string }>()
  const isCreating = !speciesId

  if (!usePermissions(routes.editSpeciesWithVar)) {
    return <NoPermissionMessage />
  }

  return (
    <>
      <Heading variant="h1">{isCreating ? 'Create' : 'Edit'} Species</Heading>
      <GenericEditor
        fields={editableFields}
        collectionName={CollectionNames.Species}
        id={speciesId}
        analyticsCategory="EditSpecies"
        getSuccessUrl={(newId) =>
          routes.viewSpeciesWithVar.replace(
            ':speciesIdOrSlug',
            newId || speciesId
          )
        }
        cancelUrl={
          speciesId
            ? routes.viewSpeciesWithVar.replace(':speciesIdOrSlug', speciesId)
            : routes.viewAllSpecies
        }
      />
    </>
  )
}

export default () => {
  const { speciesId } = useParams<{ speciesId: string }>()
  const isCreating = !speciesId

  return (
    <>
      <Helmet>
        <title>{isCreating ? 'Create' : 'Edit'} a species | VRCArena</title>
        <meta
          name="description"
          content={`Use this form to ${
            isCreating ? 'create' : 'edit'
          } a species.`}
        />
      </Helmet>
      <View />
    </>
  )
}
