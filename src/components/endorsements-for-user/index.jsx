import React, { useCallback } from 'react'

import AssetResults from '../asset-results'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import NoResultsMessage from '../no-results-message'

import useDataStore from '../../hooks/useDataStore'

export default ({ userId }) => {
  const getQuery = useCallback(
    (supabase) =>
      supabase
        .from('getEndorsementAssetResults'.toLowerCase())
        .select('*')
        .eq('userid', userId),
    [userId]
  )
  const [isLoading, lastErrorCode, assetsEndorsed] = useDataStore(
    getQuery,
    'endorsements-for-user'
  )

  if (isLoading) {
    return <LoadingIndicator message="Loading endorsements..." />
  }

  if (lastErrorCode !== null) {
    return <ErrorMessage>Failed to find the endorsements</ErrorMessage>
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
