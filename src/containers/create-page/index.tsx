import React from 'react'
import { useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet'

import Heading from '../../components/heading'
import NoPermissionMessage from '../../components/no-permission-message'

import * as routes from '../../routes'
import useIsEditor from '../../hooks/useIsEditor'
import ErrorMessage from '../../components/error-message'
import SuccessMessage from '../../components/success-message'
import LoadingIndicator from '../../components/loading-indicator'
import useDataStoreCreate from '../../hooks/useDataStoreCreate'
import { CollectionNames, Page } from '../../modules/pages'
import Button from '../../components/button'

const CreateButton = () => {
  const isEditor = useIsEditor()
  const [isCreating, isSuccess, lastErrorCode, createPage] =
    useDataStoreCreate<Page>(CollectionNames.Pages)
  const { parentName, pageName } = useParams<{
    parentName: string
    pageName: string
  }>()

  if (!isEditor) {
    return null
  }

  if (isCreating) {
    return <LoadingIndicator message="Creating page..." />
  }

  if (isSuccess) {
    return (
      <SuccessMessage
        controls={
          <Button
            url={routes.pagesWithParentAndPageVar
              .replace(':parentName', parentName)
              .replace(':pageName', pageName)}>
            View Page
          </Button>
        }>
        Page has been created
      </SuccessMessage>
    )
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>Failed to create page (code {lastErrorCode})</ErrorMessage>
    )
  }

  const onClickCreate = () => {
    createPage(
      {
        id: pageName,
        parent: parentName,
        title: 'Untitled page',
        description: '',
        content: '',
      },
      false,
      true
    )
  }

  return <Button onClick={onClickCreate}>Create This Page</Button>
}

const View = () => {
  const { parentName, pageName } = useParams<{
    parentName: string
    pageName: string
  }>()
  const isEditor = useIsEditor()

  if (!isEditor) {
    return <NoPermissionMessage />
  }

  return (
    <>
      <Heading variant="h1">
        Create Page {parentName}/{pageName}
      </Heading>
      <CreateButton />
    </>
  )
}

export default () => {
  return (
    <>
      <Helmet>
        <title>Create a page | VRCArena</title>
        <meta name="description" content={`Use this form to create a page`} />
      </Helmet>
      <View />
    </>
  )
}
