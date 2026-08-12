import React from 'react'
import { useParams } from 'react-router-dom'
import { Helmet } from '@unhead/react/helmet'

import * as routes from '@/routes'
import { CollectionNames } from '@/modules/tagsuggestions'

import usePermissions from '@/hooks/usePermissions'

import GenericEditor from '@/components/generic-editor'
import Heading from '@/components/heading'
import NoPermissionMessage from '@/components/no-permission-message'
import { TagSuggestion } from '@/modules/tagsuggestions'
import useQueryParam from '@/hooks/useQueryParam'

import tagSuggestionEditableFields from '@/editable-fields/tagsuggestions'

const View = () => {
  const tagNameFromUrl = useQueryParam('tag')
  const { tagSuggestionId } = useParams<{ tagSuggestionId: string }>()
  const isCreating = !tagSuggestionId || tagSuggestionId === 'create'

  if (
    !usePermissions(
      isCreating ? routes.createTagSuggestion : routes.editTagSuggestionWithVar
    )
  ) {
    return <NoPermissionMessage />
  }

  return (
    <>
      <Heading variant="h1">
        {isCreating ? 'Create' : 'Edit'} Tag Suggestion
      </Heading>
      <GenericEditor<TagSuggestion>
        fields={tagSuggestionEditableFields}
        collectionName={CollectionNames.TagSuggestions}
        id={isCreating ? undefined : tagSuggestionId}
        analyticsCategory={
          isCreating ? 'CreateTagSuggestion' : 'EditTagSuggestion'
        }
        saveBtnAction="Click save tag suggestion button"
        cancelBtnAction="Click cancel button"
        successUrl={routes.viewTagSuggestionWithVar.replace(
          ':tagSuggestionId',
          tagSuggestionId
        )}
        getSuccessUrl={(newId) =>
          routes.viewTagSuggestionWithVar.replace(
            ':tagSuggestionId',
            newId || tagSuggestionId
          )
        }
        cancelUrl={
          isCreating
            ? routes.tagSuggestions
            : routes.viewTagSuggestionWithVar.replace(
                ':tagSuggestionId',
                tagSuggestionId
              )
        }
        overrideFields={
          tagNameFromUrl
            ? {
                targettag: tagNameFromUrl,
              }
            : undefined
        }
      />
    </>
  )
}

export default () => {
  const { tagSuggestionId } = useParams<{ tagSuggestionId: string }>()
  const isCreating = !tagSuggestionId || tagSuggestionId === 'create'

  return (
    <>
      <Helmet>
        <title>{isCreating ? 'Create' : 'Edit'} tag suggestion</title>
        <meta
          name="description"
          content={`Use this form to ${
            isCreating ? 'create' : 'edit'
          } a tag suggestion.`}
        />
      </Helmet>
      <View />
    </>
  )
}
