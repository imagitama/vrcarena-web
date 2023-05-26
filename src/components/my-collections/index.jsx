import React from 'react'

import CollectionResults from '../collection-results'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import NoResultsMessage from '../no-results-message'
import MyCollection from '../my-collection'
import Heading from '../heading'
import Notice from '../notice'
import useMyCollections from '../../hooks/useMyCollections'

const MyCollections = () => {
  const [isLoading, isErrored, myCollections] = useMyCollections()

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to find your collections</ErrorMessage>
  }

  if (!myCollections || !myCollections.length) {
    return <NoResultsMessage>No collections found</NoResultsMessage>
  }

  return <CollectionResults collections={myCollections} />
}

const noticeId = 'creating-a-collection'

export default () => {
  return (
    <>
      <Heading variant="h2">Owned Assets</Heading>
      <MyCollection />
      <Heading variant="h2">Custom Collections</Heading>
      <MyCollections />
      <Notice
        id={noticeId}
        title="Creating a collection"
        message="Create a new collection by viewing an asset and use the button in the sidebar"
      />
    </>
  )
}
