import React from 'react'
import { useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet'

import GenericEditor from '../../components/generic-editor'
import Heading from '../../components/heading'

import * as routes from '../../routes'
import NoPermissionMessage from '../../components/no-permission-message'
import { CollectionNames } from '../../modules/authors'
import usePermissions from '../../hooks/usePermissions'

const View = () => {
  const { authorId } = useParams<{ authorId: string }>()
  const isCreating = !authorId || authorId === 'create'

  if (
    !usePermissions(isCreating ? routes.createAuthor : routes.editAuthorWithVar)
  ) {
    return <NoPermissionMessage />
  }

  return (
    <>
      <Heading variant="h1">{isCreating ? 'Create' : 'Edit'} Author</Heading>
      <GenericEditor
        collectionName={CollectionNames.Authors}
        id={isCreating ? undefined : authorId}
        analyticsCategory={isCreating ? 'CreateAuthor' : 'EditAuthor'}
        saveBtnAction="Click save author button"
        viewBtnAction="Click view item button after save"
        cancelBtnAction="Click cancel button"
        successUrl={routes.viewAuthorWithVar.replace(':authorId', authorId)}
        getSuccessUrl={(newId) =>
          routes.viewAuthorWithVar.replace(':authorId', newId || authorId)
        }
        cancelUrl={
          isCreating
            ? routes.authors
            : routes.viewAuthorWithVar.replace(':authorId', authorId)
        }
      />
    </>
  )
}

export default () => {
  const { authorId } = useParams<{ authorId: string }>()
  const isCreating = !authorId || authorId === 'create'

  return (
    <>
      <Helmet>
        <title>{isCreating ? 'Create' : 'Edit'} an author | VRCArena</title>
        <meta
          name="description"
          content={`Use this form to ${
            isCreating ? 'create' : 'edit'
          } an author.`}
        />
      </Helmet>
      <View />
    </>
  )
}
