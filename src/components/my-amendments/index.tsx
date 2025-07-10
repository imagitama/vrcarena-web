import React from 'react'

import useDatabaseQuery, {
  Operators,
  OrderDirections,
} from '../../hooks/useDatabaseQuery'
import useUserId from '../../hooks/useUserId'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import AmendmentResults from '../amendment-results'
import { FullAmendment, ViewNames } from '../../modules/amendments'

export default () => {
  const userId = useUserId()
  const [isLoading, lastErrorCode, results] = useDatabaseQuery<FullAmendment>(
    ViewNames.GetFullAmendments,
    [['createdby', Operators.EQUALS, userId]],
    {
      orderBy: ['createdat', OrderDirections.DESC],
    }
  )

  if (isLoading || !results) {
    return <LoadingIndicator message="Loading amendments..." />
  }

  if (lastErrorCode) {
    return (
      <ErrorMessage>
        Failed to load amendments (code {lastErrorCode}
      </ErrorMessage>
    )
  }

  return <AmendmentResults results={results} />
}
