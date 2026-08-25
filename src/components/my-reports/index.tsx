import React from 'react'

import useDatabaseQuery, { Operators } from '@/hooks/useDatabaseQuery'
import useUserId from '@/hooks/useUserId'
import { ViewNames, FullReport } from '@/modules/reports'

import LoadingIndicator from '@/components/loading-indicator'
import ErrorMessage from '@/components/error-message'
import ReportResults from '@/components/report-results'
import NoResultsMessage from '@/components/no-results-message'

export default () => {
  const myUserId = useUserId()
  const [isLoading, lastErrorCode, results] = useDatabaseQuery<FullReport>(
    ViewNames.GetFullReports,
    [['createdby', Operators.EQUALS, myUserId]],
    { queryName: 'my-reports' }
  )

  if (isLoading || !results) {
    return <LoadingIndicator message="Loading your reports..." />
  }

  if (lastErrorCode) {
    return (
      <ErrorMessage errorCode={lastErrorCode}>
        Failed to load your reports
      </ErrorMessage>
    )
  }

  if (!results.length) {
    return <NoResultsMessage>You have not made any reports</NoResultsMessage>
  }

  return <ReportResults reports={results} />
}
