import React from 'react'

import useDatabaseQuery, { Operators } from '@/hooks/useDatabaseQuery'

import LoadingIndicator from '@/components/loading-indicator'
import ErrorMessage from '@/components/error-message'
import SupportTicketResults from '@/components/support-ticket-results'
import useUserId from '@/hooks/useUserId'
import NoResultsMessage from '@/components/no-results-message'
import { ViewNames, FullSupportTicket } from '@/modules/support-tickets'

export default () => {
  const myUserId = useUserId()
  const [isLoading, lastErrorCode, results] =
    useDatabaseQuery<FullSupportTicket>(ViewNames.GetFullSupportTickets, [
      ['createdby', Operators.EQUALS, myUserId],
    ])

  if (isLoading || !results) {
    return <LoadingIndicator message="Loading your support tickets..." />
  }

  if (lastErrorCode) {
    return (
      <ErrorMessage>
        Failed to load your support tickets (code {lastErrorCode})
      </ErrorMessage>
    )
  }

  if (!results.length) {
    return (
      <NoResultsMessage>You have not made any support tickets</NoResultsMessage>
    )
  }

  return <SupportTicketResults supportTickets={results} />
}
