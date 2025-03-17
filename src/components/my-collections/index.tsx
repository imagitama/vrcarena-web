import React from 'react'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import NoResultsMessage from '../no-results-message'
import MyCollection from '../my-collection'
import Heading from '../heading'
import Notice from '../notice'
import useMyCollections from '../../hooks/useMyCollections'
import ResultsItems from '../results-items'
import CollectionResultsItem from '../collection-results-item'

const MyCollections = () => {
  const [isLoading, isErrored, myCollections] = useMyCollections()

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return (
      <ErrorMessage>Failed to load your owned assets collections</ErrorMessage>
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

const noticeId = 'creating-a-collection'

export default () => {
  return (
    <>
      <Heading variant="h2">Your Owned Assets Collection</Heading>
      <MyCollection />
      <Heading variant="h2">Collections</Heading>
      <MyCollections />
      <Notice
        title="Creating a collection"
        message="Create a new collection by viewing an asset and use the button in the sidebar"
      />
    </>
  )
}
