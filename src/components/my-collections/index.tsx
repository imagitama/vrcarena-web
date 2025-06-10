import React from 'react'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import NoResultsMessage from '../no-results-message'
import MyCollection from '../my-collection'
import Heading from '../heading'
import useMyCollections from '../../hooks/useMyCollections'
import ResultsItems from '../results-items'
import CollectionResultsItem from '../collection-results-item'
import InfoMessage from '../info-message'

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
