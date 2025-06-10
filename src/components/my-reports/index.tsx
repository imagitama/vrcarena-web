import React from 'react'

import useDatabaseQuery, { Operators } from '../../hooks/useDatabaseQuery'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import ReportResults from '../report-results'
import useUserId from '../../hooks/useUserId'
import NoResultsMessage from '../no-results-message'
import { ViewNames, FullReport } from '../../modules/reports'

export default () => {
  const myUserId = useUserId()
  const [isLoading, lastErrorCode, results] = useDatabaseQuery<FullReport>(
    ViewNames.GetFullReports,
    [['createdby', Operators.EQUALS, myUserId]]
  )

  if (isLoading || !results) {
    return <LoadingIndicator message="Loading your reports..." />
  }

  if (lastErrorCode) {
    return (
      <ErrorMessage>
        Failed to load your reports (code {lastErrorCode})
      </ErrorMessage>
    )
  }

  if (!results.length) {
    return <NoResultsMessage>You have not made any reports</NoResultsMessage>
  }

  return <ReportResults reports={results} />
}
