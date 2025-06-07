import React from 'react'

import useDatabaseQuery, { Operators } from '../../hooks/useDatabaseQuery'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import useUserId from '../../hooks/useUserId'
import NoResultsMessage from '../no-results-message'
import { FullClaim, ViewNames } from '../../modules/claims'
import ClaimResults from '../claim-results'

const MyClaims = () => {
  const myUserId = useUserId()
  const [isLoading, isErrored, results] = useDatabaseQuery<FullClaim>(
    ViewNames.GetFullClaims,
    [['createdby', Operators.EQUALS, myUserId]]
  )

  if (isLoading || !results) {
    return <LoadingIndicator message="Loading your claims..." />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to load your claims</ErrorMessage>
  }

  if (!results.length) {
    return <NoResultsMessage>You have not made any claims</NoResultsMessage>
  }

  console.log('CLAIMS', results)

  return <ClaimResults claims={results} />
}

export default MyClaims
