import React, { useCallback } from 'react'

import AssetResults from '../asset-results'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import NoResultsMessage from '../no-results-message'

import useDataStore from '../../hooks/useDataStore'
import { client as supabase } from '../../supabase'
import { Asset } from '../../modules/assets'

const CollectionForUser = ({ userId }: { userId: string }) => {
  const getQuery = useCallback(
    () =>
      supabase
        .from('getCollectionAssetResults'.toLowerCase())
        .select('*')
        .eq('userid', userId),
    [userId]
  )
  const [isLoading, lastErrorCode, assetsInCollection] = useDataStore<Asset[]>(
    getQuery,
    'collection-for-user'
  )

  if (isLoading) {
    return <LoadingIndicator message="Loading collection..." />
  }

  if (lastErrorCode !== null) {
    return <ErrorMessage>Failed to find the collection</ErrorMessage>
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
