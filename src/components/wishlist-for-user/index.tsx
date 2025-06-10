import React, { useCallback } from 'react'

import AssetResults from '../asset-results'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import NoResultsMessage from '../no-results-message'

import useDataStore, { GetQueryFn } from '../../hooks/useDataStore'
import { FullAsset, ViewNames } from '../../modules/assets'

export default ({ userId }: { userId: string }) => {
  const getQuery = useCallback<GetQueryFn<FullAsset>>(
    (client) =>
      client
        .from(ViewNames.GetWishlistAssetResults)
        .select('*')
        .eq('userid', userId),
    [userId]
  )
  const [isLoading, lastErrorCode, assetsInWishlist] = useDataStore<FullAsset>(
    getQuery,
    'wishlist-for-user'
  )

  if (isLoading) {
    return <LoadingIndicator message="Loading wishlist..." />
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>
        Failed to find the wishlist (code {lastErrorCode})
      </ErrorMessage>
    )
  }

  if (!assetsInWishlist || !assetsInWishlist.length) {
    return (
      <NoResultsMessage>
        This user has no assets in their wishlist
      </NoResultsMessage>
    )
  }

  return <AssetResults assets={assetsInWishlist} />
}
