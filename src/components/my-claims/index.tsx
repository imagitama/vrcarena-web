import React from 'react'

import useDatabaseQuery, { Operators } from '@/hooks/useDatabaseQuery'
import useUserId from '@/hooks/useUserId'
import { FullClaim, ViewNames } from '@/modules/claims'

import LoadingIndicator from '@/components/loading-indicator'
import ErrorMessage from '@/components/error-message'
import NoResultsMessage from '@/components/no-results-message'
import ClaimResults from '@/components/claim-results'

const MyClaims = () => {
  const myUserId = useUserId()
  const [isLoading, lastErrorCode, results] = useDatabaseQuery<FullClaim>(
    ViewNames.GetFullClaims,
    [['createdby', Operators.EQUALS, myUserId]]
  )

  if (isLoading || !results) {
    return <LoadingIndicator message="Loading your claims..." />
  }

  if (lastErrorCode) {
    return (
      <ErrorMessage>
        Failed to load your claims (code {lastErrorCode})
      </ErrorMessage>
    )
  }

  if (!results.length) {
    return <NoResultsMessage>You have not made any claims</NoResultsMessage>
  }

  return <ClaimResults claims={results} />
}

export default MyClaims
