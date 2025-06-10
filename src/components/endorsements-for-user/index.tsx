import React, { useCallback } from 'react'

import AssetResults from '../asset-results'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import NoResultsMessage from '../no-results-message'

import useDataStore, { GetQueryFn } from '../../hooks/useDataStore'
import { Asset, ViewNames } from '../../modules/assets'

export default ({ userId }: { userId: string }) => {
  const getQuery = useCallback<GetQueryFn<Asset>>(
    (supabase) =>
      supabase
        .from(ViewNames.GetEndorsementAssetResults)
        .select('*')
        .eq('userid', userId),
    [userId]
  )
  const [isLoading, lastErrorCode, assetsEndorsed] = useDataStore<Asset>(
    getQuery,
    'endorsements-for-user'
  )

  if (isLoading) {
    return <LoadingIndicator message="Loading endorsements..." />
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>
        Failed to find the endorsements (code {lastErrorCode})
      </ErrorMessage>
    )
  }

  if (!assetsEndorsed || !assetsEndorsed.length) {
    return (
      <NoResultsMessage>
        This user has not endorsed any assets yet
      </NoResultsMessage>
    )
  }

  return <AssetResults assets={assetsEndorsed} />
}
