import React, { useCallback } from 'react'
import { SupabaseClient } from '@supabase/supabase-js'

import useDataStore from '@/hooks/useDataStore'
import { Asset, ViewNames } from '@/modules/assets'

import AssetResults from '@/components/asset-results'
import LoadingIndicator from '@/components/loading-indicator'
import ErrorMessage from '@/components/error-message'
import NoResultsMessage from '@/components/no-results-message'

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
    { queryName: 'collection-for-user' }
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
