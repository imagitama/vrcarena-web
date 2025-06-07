import React from 'react'

import EndorsementListItem from '../endorsement-list-item'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import NoResultsMessage from '../no-results-message'

import useDatabaseQuery, { Operators } from '../../hooks/useDatabaseQuery'

import { CollectionNames, Endorsement } from '../../modules/endorsements'

export default ({ assetId }: { assetId: string }) => {
  if (!assetId) {
    throw new Error('Cannot render endorsement list: no asset ID')
  }

  const [isLoading, isErrored, results] = useDatabaseQuery<Endorsement>(
    CollectionNames.Endorsements,
    [['asset', Operators.EQUALS, assetId]]
  )

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to load endorsements</ErrorMessage>
  }

  if (!results || !results.length) {
    return <NoResultsMessage>No endorsements found</NoResultsMessage>
  }

  return (
    <>
      {results.map((result) => (
        <EndorsementListItem key={result.id} endorsement={result} />
      ))}
    </>
  )
}
