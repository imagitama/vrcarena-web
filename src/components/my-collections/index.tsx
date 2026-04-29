import React from 'react'

import useMyCollections from '@/hooks/useMyCollections'

import LoadingIndicator from '@/components/loading-indicator'
import ErrorMessage from '@/components/error-message'
import NoResultsMessage from '@/components/no-results-message'
import MyCollection from '@/components/my-collection'
import Heading from '@/components/heading'
import ResultsItems from '@/components/results-items'
import CollectionResultsItem from '@/components/collection-results-item'
import InfoMessage from '@/components/info-message'

const MyCollections = () => {
  const [isLoading, lastErrorCode, myCollections] = useMyCollections()

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>
        Failed to load your owned assets collections (code {lastErrorCode})
      </ErrorMessage>
    )
  }

  if (!myCollections || !myCollections.length) {
    return <NoResultsMessage>No collections found</NoResultsMessage>
  }

  return (
    <ResultsItems>
      {myCollections.map((item) => (
        <CollectionResultsItem key={item.id} collection={item} />
      ))}
    </ResultsItems>
  )
}

export default () => {
  return (
    <>
      <Heading variant="h2">Your Owned Assets Collection</Heading>
      <MyCollection />
      <Heading variant="h2">Collections</Heading>
      <MyCollections />
      <Heading variant="h2">Creating Collections</Heading>
      <InfoMessage>
        When viewing an asset click "Add To Collection" in the sidebar to add to
        an existing or create a new collection.
      </InfoMessage>
    </>
  )
}
