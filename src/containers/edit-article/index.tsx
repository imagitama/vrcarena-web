import React from 'react'
import { Helmet } from '@unhead/react/helmet'
import { useParams } from 'react-router'

import * as routes from '@/routes'
import { CollectionNames, Article } from '@/modules/articles'
import usePermissions from '@/hooks/usePermissions'

import NoPermissionMessage from '@/components/no-permission-message'
import Heading from '@/components/heading'
import GenericEditor from '@/components/generic-editor'
import editableFields from '@/editable-fields/articles'
import { EMAIL } from '@/config'
import InfoMessage from '@/components/info-message'

const View = ({ articleId }: { articleId?: string }) => {
  const { parentTable, parentId } = useParams<{
    parentTable?: string
    parentId?: string
  }>()

  const isCreating = articleId === undefined

  if (
    !usePermissions(
      isCreating ? routes.createArticle : routes.editArticleWithVar
    )
  ) {
    return <NoPermissionMessage />
  }

  return (
    <GenericEditor<Article>
      itemTypeSingular="article"
      collectionName={CollectionNames.Articles}
      id={articleId}
      fields={editableFields}
      overrideFields={{
        parenttable: parentTable || null,
        parentid: parentId || null,
      }}
      successMessage={
        <>
          Our staff have been notified of your article and our staff try to
          approve them within 48 hours. If it has been longer than 48 hours,
          please enquire about it via Discord or email ({EMAIL}).
        </>
      }
    />
  )
}

export default () => {
  const { articleId } = useParams<{
    articleId?: string
  }>()

  const isCreating = articleId === undefined

  return (
    <>
      <Helmet>
        <title>{isCreating ? 'Create' : 'Edit'} an article</title>
        <meta
          name="description"
          content="Use this form to create or edit an article."
        />
      </Helmet>
      <Heading variant="h1">{isCreating ? 'Create' : 'Edit'} Article</Heading>
      <InfoMessage title="What is an article?" hideId="what-is-article">
        News from third party sites, news about VRCArena, updates for a specific
        asset (shown on the asset page).
      </InfoMessage>
      <View />
    </>
  )
}
