import React, { useCallback } from 'react'

import useDataStore, { GetQueryFn } from '@/hooks/useDataStore'
import useUserId from '@/hooks/useUserId'
import { FullAsset, ViewNames } from '@/modules/assets'

import LoadingIndicator from '@/components/loading-indicator'
import ErrorMessage from '@/components/error-message'
import AssetResults from '@/components/asset-results'
import NoResultsMessage from '@/components/no-results-message'

export default () => {
  const userId = useUserId()
  const getQuery = useCallback<GetQueryFn<FullAsset>>(
    (client) =>
      client.from(ViewNames.GetFullAssets).select('*').eq('featuredby', userId),
    [userId]
  )
  const [isLoading, lastErrorCode, results] = useDataStore<FullAsset>(
    getQuery,
    'featured-assets-for-user'
  )

  if (isLoading) {
    return <LoadingIndicator message="Loading featured assets..." />
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>
        Failed to load featured assets (code {lastErrorCode})
      </ErrorMessage>
    )
  }

  if (!results || !results.length) {
    return (
      <NoResultsMessage>
        You do not have any featured assets. If you are a patron you can view an
        asset and click Feature to add it to the rotation.
      </NoResultsMessage>
    )
  }

  return <AssetResults assets={results} />
}
