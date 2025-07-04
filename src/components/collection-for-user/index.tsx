import React, { useCallback } from 'react'

import AssetResults from '../asset-results'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import NoResultsMessage from '../no-results-message'

import useDataStore from '../../hooks/useDataStore'
import { Asset, ViewNames } from '../../modules/assets'
import { SupabaseClient } from '@supabase/supabase-js'

const CollectionForUser = ({ userId }: { userId: string }) => {
  const getQuery = useCallback(
    (supabase: SupabaseClient) =>
      supabase
        .from(ViewNames.GetCollectionAssetResults)
        .select('*')
        .eq('userid', userId),
    [userId]
  )
  const [isLoading, lastErrorCode, assetsInCollection] = useDataStore<Asset>(
    getQuery,
    'collection-for-user'
  )

  if (isLoading) {
    return <LoadingIndicator message="Loading collection..." />
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>
        Failed to find the collection (code {lastErrorCode})
      </ErrorMessage>
    )
  }

  if (!assetsInCollection || !assetsInCollection.length) {
    return (
      <NoResultsMessage>
        This user has no assets in their collection
      </NoResultsMessage>
    )
  }

  return <AssetResults assets={assetsInCollection} />
}

export default CollectionForUser
