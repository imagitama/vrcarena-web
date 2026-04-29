import React, { useCallback } from 'react'

import useDataStore, { GetQueryFn } from '@/hooks/useDataStore'
import useUserId from '@/hooks/useUserId'
import { Asset, ViewNames } from '@/modules/assets'

import AssetResults from '@/components/asset-results'
import LoadingIndicator from '@/components/loading-indicator'
import ErrorMessage from '@/components/error-message'
import NoResultsMessage from '@/components/no-results-message'

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
