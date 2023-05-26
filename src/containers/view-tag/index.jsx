import React, { useState } from 'react'
import { Helmet } from 'react-helmet'
import { useParams } from 'react-router'
import LazyLoad from 'react-lazyload'

import {
  Operators,
  CollectionNames,
  AssetFieldNames
} from '../../hooks/useDatabaseQuery'
import useAssetSearch from '../../hooks/useAssetSearch'

import LoadingIndicator from '../../components/loading-indicator'
import AssetResults from '../../components/asset-results'
import ErrorMessage from '../../components/error-message'
import Heading from '../../components/heading'
import AllTagsBrowser from '../../components/all-tags-browser'
import NoResultsMessage from '../../components/no-results-message'
import CategorySelector from '../../components/category-selector'
import Button from '../../components/button'

import * as routes from '../../routes'
import { searchIndexNameLabels } from '../../modules/app'

function AssetsByTag({ tagName, selectedCategory }) {
  const [isLoading, isErrored, results] = useAssetSearch(tagName, {
    // [AssetFieldNames.tags]: [tagName],
    ...(selectedCategory
      ? {
          [AssetFieldNames.category]: [selectedCategory]
        }
      : {})
  })

  if (isLoading || !results) {
    return <LoadingIndicator message="Loading assets..." />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to get assets</ErrorMessage>
  }

  if (!results.length) {
    return (
      <NoResultsMessage
        callToActionUrl={routes.searchWithVar
          .replace(':indexName', searchIndexNameLabels[CollectionNames.Assets])
          .replace(':searchTerm', tagName)}
        callToActionLabel="Try search instead"
      />
    )
  }

  return <AssetResults assets={results} />
}

export default () => {
  const { tagName } = useParams()
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [isCategoryFilterActive, setIsCategoryFilterActive] = useState(false)

  const onSelectCategory = name => {
    setSelectedCategory(name)
    setIsCategoryFilterActive(false)
  }

  return (
    <>
      <Helmet>
        <title>Browse everything with tag "{tagName}" | VRCArena</title>
        <meta
          name="description"
          content={`Browse all of the accessories, tutorials, animations, avatars and news articles with the tag ${tagName}`}
        />
      </Helmet>
      <Heading variant="h1">Browse tag "{tagName}"</Heading>
      <Button
        onClick={() => setIsCategoryFilterActive(currentVal => !currentVal)}>
        Filter by category
      </Button>
      {isCategoryFilterActive && (
        <CategorySelector onSelect={onSelectCategory} />
      )}
      <AssetsByTag tagName={tagName} selectedCategory={selectedCategory} />
    </>
  )
}
