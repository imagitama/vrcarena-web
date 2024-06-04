import React, { useCallback } from 'react'

import useDataStore from '../../hooks/useDataStore'
import { client as supabase } from '../../supabase'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import AmendmentResults from '../amendment-results'
import { AmendmentsFieldNames } from '../../modules/amendments'
import { CollectionNames } from '../../hooks/useDatabaseQuery'

export default ({ assetId }: { assetId: string }) => {
  const getQuery = useCallback(
    () =>
      supabase
        .from('getAmendmentsWaitingForApproval'.toLowerCase())
        .select('*')
        .eq(AmendmentsFieldNames.parentTable, CollectionNames.Assets)
        .eq(AmendmentsFieldNames.parent, assetId),
    [assetId]
  )
  const [isLoading, lastErrorCode, results] = useDataStore(
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
