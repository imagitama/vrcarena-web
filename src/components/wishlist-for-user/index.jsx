import React, { useCallback } from 'react'

import AssetResults from '../asset-results'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import NoResultsMessage from '../no-results-message'

import useDataStore from '../../hooks/useDataStore'
import { client as supabase } from '../../supabase'

export default ({ userId }) => {
  const getQuery = useCallback(
    () =>
      supabase
        .from('getWishlistAssetResults'.toLowerCase())
        .select('*')
        .eq('userid', userId),
    [userId]
  )
  const [isLoading, lastErrorCode, assetsInWishlist] = useDataStore(
    getQuery,
    'wishlist-for-user'
  )

  if (isLoading) {
    return <LoadingIndicator message="Loading wishlist..." />
  }

  if (lastErrorCode !== null) {
    return <ErrorMessage>Failed to find the wishlist</ErrorMessage>
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
