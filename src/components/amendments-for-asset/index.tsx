import React, { useCallback } from 'react'
import { SupabaseClient } from '@supabase/supabase-js'

import useDataStore from '../../hooks/useDataStore'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import AmendmentResults from '../amendment-results'
import { AmendmentsFieldNames, FullAmendment } from '../../modules/amendments'
import { CollectionNames } from '../../hooks/useDatabaseQuery'

export default ({ assetId }: { assetId: string }) => {
  const getQuery = useCallback(
    (client: SupabaseClient) =>
      client
        .from('getAmendmentsWaitingForApproval'.toLowerCase())
        .select('*')
        .eq(AmendmentsFieldNames.parentTable, CollectionNames.Assets)
        .eq(AmendmentsFieldNames.parent, assetId),
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
