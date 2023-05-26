import React from 'react'
import { useParams } from 'react-router'
import { Helmet } from 'react-helmet'

import GenericEditor from '../../components/generic-editor'
import Heading from '../../components/heading'
import ErrorMessage from '../../components/error-message'
import NoPermissionMessage from '../../components/no-permission-message'
import LoadingIndicator from '../../components/loading-indicator'

import { CollectionNames } from '../../hooks/useDatabaseQuery'
import useUserRecord from '../../hooks/useUserRecord'

import * as routes from '../../routes'
import { canEditSpecies } from '../../utils'
import useDataStoreItem from '../../hooks/useDataStoreItem'

const View = () => {
  const { speciesId } = useParams()
  const [isLoading, isErrored, user] = useUserRecord()
  const [isLoadingItem, isErrorLoadingItem, result] = useDataStoreItem(
    CollectionNames.Species,
    speciesId,
    'edit-species'
  )

  if (isLoading || isLoadingItem) {
    return <LoadingIndicator />
  }

  if (isErrored || isErrorLoadingItem) {
    return <ErrorMessage />
  }

  if (!canEditSpecies(user, result)) {
    return <NoPermissionMessage />
  }

  return (
    <>
      <Heading variant="h1">Edit Species</Heading>
      <GenericEditor
        collectionName={CollectionNames.Species}
        id={speciesId}
        analyticsCategory="EditSpecies"
        saveBtnAction="Click save species button"
        viewBtnAction="Click view item button after save"
        cancelBtnAction="Click cancel button"
        successUrl={routes.viewSpeciesWithVar.replace(
          ':speciesIdOrSlug',
          speciesId
        )}
        cancelUrl={routes.viewSpeciesWithVar.replace(
          ':speciesIdOrSlug',
          speciesId
        )}
      />
    </>
  )
}

export default () => (
  <>
    <Helmet>
      <title>Edit a species | VRCArena</title>
      <meta name="description" content="Use this form to edit a species." />
    </Helmet>
    <View />
  </>
)
