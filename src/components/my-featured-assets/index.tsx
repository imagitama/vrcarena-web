import React, { useCallback } from 'react'
import useDataStore from '../../hooks/useDataStore'
import useUserId from '../../hooks/useUserId'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import AssetResults from '../asset-results'
import NoResultsMessage from '../no-results-message'
import { FullAsset, ViewNames } from '../../modules/assets'

export default () => {
  const userId = useUserId()
  const getQuery = useCallback(
    (supabase) =>
      supabase
        .from(ViewNames.GetFullAssets)
        .select('*')
        .eq('featuredby', userId),
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
    return <ErrorMessage>Failed to load featured assets</ErrorMessage>
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
