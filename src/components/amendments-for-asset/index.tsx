import React, { useCallback } from 'react'
import { SupabaseClient } from '@supabase/supabase-js'

import useDataStore from '../../hooks/useDataStore'
import { FullAmendment, ViewNames } from '../../modules/amendments'
import { CollectionNames as AssetsCollectionNames } from '../../modules/assets'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import AmendmentResults from '../amendment-results'

export default ({ assetId }: { assetId: string }) => {
  const getQuery = useCallback(
    (client: SupabaseClient) =>
      client
        .from(ViewNames.GetAmendmentsWaitingForApproval)
        .select('*')
        .eq('parenttable', AssetsCollectionNames.Assets)
        .eq('parent', assetId),
    [assetId]
  )
  const [isLoading, lastErrorCode, results] = useDataStore<FullAmendment>(
    getQuery,
    'asset-amendments'
  )

  if (isLoading || !results || !Array.isArray(results)) {
    return <LoadingIndicator message="Loading amendments..." />
  }

  if (lastErrorCode !== null) {
    return <ErrorMessage>Failed to load amendments</ErrorMessage>
  }

  if (!results.length) {
    return <ErrorMessage>No amendments</ErrorMessage>
  }

  return <AmendmentResults results={results} showParentDetails={false} />
}
