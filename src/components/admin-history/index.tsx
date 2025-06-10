import React from 'react'

import useDatabaseQuery, {
  OrderDirections,
  Operators,
} from '../../hooks/useDatabaseQuery'
import { HistoryEntry, ViewNames } from '../../modules/history'

import HistoryResults from '../history-results'
import ErrorMessage from '../error-message'
import LoadingIndicator from '../loading-indicator'
import NoResultsMessage from '../no-results-message'
import Heading from '../heading'

const History = ({
  id,
  type,
  limit,
}: {
  id?: string
  type?: string
  limit: number
}) => {
  const [isLoading, lastErrorCode, results] = useDatabaseQuery<HistoryEntry>(
    ViewNames.GetAllHistory,
    id && type
      ? [
          ['parent', Operators.EQUALS, id],
          ['parenttable', Operators.EQUALS, type],
        ]
      : [],
    {
      limit: limit,
      orderBy: ['createdat', OrderDirections.DESC],
      queryName: 'admin-history',
    }
  )

  if (isLoading || !results || !Array.isArray(results)) {
    return <LoadingIndicator />
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>Failed to load history (code {lastErrorCode})</ErrorMessage>
    )
  }

  if (!results.length) {
    return <NoResultsMessage>No history found</NoResultsMessage>
  }

  return <HistoryResults results={results} />
}

const MetaHistory = ({
  id,
  type,
  limit,
}: {
  id?: string
  type?: string
  limit?: number
}) => {
  const [isLoading, lastErrorCode, results] = useDatabaseQuery<HistoryEntry>(
    ViewNames.GetAllHistory,
    id && type
      ? [
          ['parent', Operators.EQUALS, id],
          ['parenttable', Operators.EQUALS, type],
        ]
      : [],
    {
      limit: limit,
      orderBy: ['createdat', OrderDirections.DESC],
      queryName: 'admin-history',
    }
  )

  if (isLoading || !results || !Array.isArray(results)) {
    return <LoadingIndicator />
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>Failed to load history (code {lastErrorCode})</ErrorMessage>
    )
  }

  if (!results.length) {
    return <NoResultsMessage>No history found</NoResultsMessage>
  }

  return <HistoryResults results={results} />
}

const AdminHistory = ({
  id,
  type,
  metaType,
  limit = 20,
}: {
  id?: string
  type?: string
  metaType?: string
  limit?: number
}) => (
  <>
    <Heading variant="h3">Basic Details</Heading>
    <History id={id} type={type} limit={limit} />
    <Heading variant="h3">Meta</Heading>
    <MetaHistory id={id} type={metaType} limit={limit} />
  </>
)

export default AdminHistory
