import React, { useCallback } from 'react'
import { client as supabase } from '../../supabase'
import useDataStore from '../../hooks/useDataStore'
import useUserId from '../../hooks/useUserId'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import AssetResults from '../asset-results'
import { AssetMetaFieldNames } from '../../hooks/useDatabaseQuery'

export default () => {
  const userId = useUserId()
  const getQuery = useCallback(
    () =>
      supabase
        .from('getFeaturedAssetResults'.toLowerCase())
        .select('*')
        .eq(AssetMetaFieldNames.featuredBy, userId),
    [userId]
  )
  const [isLoading, isErrored, results] = useDataStore(
    getQuery,
    'featured-assets-for-user'
  )

  if (isLoading) {
    return <LoadingIndicator message="Loading featured assets..." />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to load featured assets</ErrorMessage>
  }

  if (!results || !results.length) {
    return (
      <ErrorMessage>
        You do not have any featured assets. If you are a patron you can view an
        asset and click Feature to add it to the rotation.
      </ErrorMessage>
    )
  }

  return <AssetResults assets={results} />
}
