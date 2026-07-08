import React, { useCallback } from 'react'
import { SupabaseClient } from '@supabase/supabase-js'

import useDataStore from '@/hooks/useDataStore'
import { FullAmendment, ViewNames } from '@/modules/amendments'
import { CollectionNames as AssetsCollectionNames } from '@/modules/assets'

import LoadingIndicator from '@/components/loading-indicator'
import ErrorMessage from '@/components/error-message'
import AmendmentResults from '@/components/amendment-results'

const AmendmentsForAsset = ({ assetId }: { assetId: string }) => {
  const getQuery = useCallback(
    (client: SupabaseClient) =>
      client
        .from(ViewNames.GetAmendmentsWaitingForApproval)
        .select('*')
        .eq('parenttable', AssetsCollectionNames.Assets)
        .eq('parent', assetId),
    [assetId]
  )
  const [isLoading, lastErrorCode, results] = useDataStore<FullAmendment<any>>(
    getQuery,
    { queryName: 'asset-amendments' }
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

export default AmendmentsForAsset
