import React, { useCallback } from 'react'

import AssetResults from '../asset-results'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import NoResultsMessage from '../no-results-message'

import useDataStore, { GetQueryFn } from '../../hooks/useDataStore'
import useUserId from '../../hooks/useUserId'
import { Asset, ViewNames } from '../../modules/assets'

export default () => {
  const userId = useUserId()
  const getQuery = useCallback<GetQueryFn<Asset>>(
    (client) =>
      client
        .from(ViewNames.GetCollectionAssetResults)
        .select('*')
        .eq('userid', userId),
    [userId]
  )
  const [isLoading, lastErrorCode, myCollection] = useDataStore<Asset>(
    getQuery,
    'my-collection'
  )

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>
        Failed to find your collection (code {lastErrorCode})
      </ErrorMessage>
    )
  }

  if (!myCollection || !myCollection.length) {
    return (
      <NoResultsMessage>
        You do not have a personal collection yet
      </NoResultsMessage>
    )
  }

  return <AssetResults assets={myCollection} />
}
