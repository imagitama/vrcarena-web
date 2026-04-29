import React, { useCallback } from 'react'

import useDataStore, { GetQueryFn } from '@/hooks/useDataStore'
import { Asset, ViewNames } from '@/modules/assets'

import AssetResults from '@/components/asset-results'
import LoadingIndicator from '@/components/loading-indicator'
import ErrorMessage from '@/components/error-message'
import NoResultsMessage from '@/components/no-results-message'

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
