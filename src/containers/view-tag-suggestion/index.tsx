import React from 'react'
import { Helmet } from '@unhead/react/helmet'
import { useParams } from 'react-router'

import * as routes from '@/routes'
import {
  CollectionNames,
  FullTagSuggestion,
  ViewNames,
} from '@/modules/tagsuggestions'

import useDataStoreItem from '@/hooks/useDataStoreItem'
import useIsLoggedIn from '@/hooks/useIsLoggedIn'

import NoResultsMessage from '@/components/no-results-message'
import LoadingIndicator from '@/components/loading-indicator'
import ErrorMessage from '@/components/error-message'
import NoPermissionMessage from '@/components/no-permission-message'
import ResolvableItem, {
  FullResolvableItem,
} from '@/components/resolvable-item'
import Heading from '@/components/heading'
import { capitalize } from '@/utils'
import TagDetails from '@/components/tag-details'
import { Tag } from '@/modules/tags'
import NoValueLabel from '@/components/no-value-label'

const View = () => {
  const { tagSuggestionId } = useParams<{ tagSuggestionId: string }>()
  const isLoggedIn = useIsLoggedIn()

  const [isLoading, lastErrorCode, item, hydrate] =
    useDataStoreItem<FullTagSuggestion>(
      ViewNames.GetFullTagSuggestions,
      isLoggedIn ? tagSuggestionId : false,
      { queryName: 'view-tag-suggestion' }
    )

  if (!isLoggedIn) {
    return <NoPermissionMessage />
  }

  if (isLoading) {
    return <LoadingIndicator message="Loading tag suggestion..." />
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>
        Failed to load tag suggestion (code {lastErrorCode})
      </ErrorMessage>
    )
  }

  if (!item) {
    return <NoResultsMessage>Tag suggestion not found</NoResultsMessage>
  }

  const { targettag: targetTag, type, relatedtag: relatedTag, fields } = item

  return (
    <ResolvableItem
      collectionName={CollectionNames.TagSuggestions}
      metaCollectionName={CollectionNames.TagSuggestionsMeta}
      title="Tag Suggestion"
      item={item as unknown as FullResolvableItem} // TODO: improve types
      url={routes.viewTagSuggestionWithVar.replace(':tagSuggestionId', item.id)}
      hydrate={hydrate}
      isAssignable={false}>
      <Heading variant="h2">Tag</Heading>
      {targetTag || <NoValueLabel>(none)</NoValueLabel>}
      <Heading variant="h2">Suggestion</Heading>
      {capitalize(type) || <NoValueLabel>(none)</NoValueLabel>}
      <Heading variant="h2">Related Tag</Heading>
      {relatedTag || <NoValueLabel>(none)</NoValueLabel>}
      <Heading variant="h2">Suggested Fields</Heading>
      {fields ? (
        <TagDetails tag={fields as Tag} />
      ) : (
        <NoValueLabel>(none)</NoValueLabel>
      )}
    </ResolvableItem>
  )
}

export default () => (
  <>
    <Helmet>
      <title>View a report</title>
      <meta
        name="description"
        content="Read more information about a report on the site."
      />
    </Helmet>
    <View />
  </>
)
