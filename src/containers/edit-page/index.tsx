import React from 'react'
import { useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet'

import GenericEditor from '../../components/generic-editor'
import Heading from '../../components/heading'
import NoPermissionMessage from '../../components/no-permission-message'
import * as routes from '../../routes'
import { CollectionNames } from '../../modules/pages'
import usePermissions from '../../hooks/usePermissions'

const View = () => {
  const { parentName, pageName } = useParams<{
    parentName: string
    pageName: string
  }>()

  if (!usePermissions(routes.editPageWithParentAndPageVar)) {
    return <NoPermissionMessage />
  }

  return (
    <>
      <Heading variant="h1">
        Edit Page {parentName}/{pageName}
      </Heading>
      <GenericEditor
        collectionName={CollectionNames.Pages}
        id={pageName}
        analyticsCategory={'EditPage'}
        saveBtnAction="Click save button"
        viewBtnAction="Click view item button after save"
        cancelBtnAction="Click cancel button"
        successUrl={routes.pagesWithParentAndPageVar
          .replace(':parentName', parentName)
          .replace(':pageName', pageName)}
        cancelUrl={routes.pagesWithParentAndPageVar
          .replace(':parentName', parentName)
          .replace(':pageName', pageName)}
      />
    </>
  )
}

export default () => {
  return (
    <>
      <Helmet>
        <title>Edit a page | VRCArena</title>
        <meta name="description" content={`Use this form to edit a page`} />
      </Helmet>
      <View />
    </>
  )
}
