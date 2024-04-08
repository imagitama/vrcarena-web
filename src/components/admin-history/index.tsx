import React from 'react'

import ErrorMessage from '../error-message'
import LoadingIndicator from '../loading-indicator'
import NoResultsMessage from '../no-results-message'
import Heading from '../heading'

import useDatabaseQuery, {
  OrderDirections,
  Operators,
  options,
} from '../../hooks/useDatabaseQuery'
import { HistoryEntry } from '../../modules/history'
import HistoryResults from '../history-results'

const History = ({
  id,
  type,
  limit,
}: {
  id: string
  type: string
  limit: number
}) => {
  const [isLoading, isErrored, results] = useDatabaseQuery<HistoryEntry>(
    'getAllHistory',
    id
      ? [
          ['parent', Operators.EQUALS, id],
          ['parenttable', Operators.EQUALS, type],
        ]
      : false,
    {
      [options.limit]: limit,
      [options.orderBy]: ['createdat', OrderDirections.DESC],
      [options.queryName]: 'admin-history',
    }
  )

  if (isLoading || !results || !Array.isArray(results)) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to retrieve history</ErrorMessage>
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
  id: string
  type: string
  limit: number
}) => {
  const [isLoading, isErrored, results] = useDatabaseQuery<HistoryEntry>(
    'getAllHistory',
    id
      ? [
          ['parent', Operators.EQUALS, id],
          ['parenttable', Operators.EQUALS, type],
        ]
      : [],
    {
      [options.limit]: limit,
      [options.orderBy]: ['createdat', OrderDirections.DESC],
      [options.queryName]: 'admin-history',
    }
  )

  if (isLoading || !results || !Array.isArray(results)) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to retrieve history</ErrorMessage>
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
  id: string
  type: string
  metaType: string
  limit?: number
}) => {
  return (
    <>
      <Heading variant="h3">Basic Details</Heading>
      <History id={id} type={type} limit={limit} />
      <Heading variant="h3">Meta</Heading>
      <MetaHistory id={id} type={metaType} limit={limit} />
    </>
  )
}

export default AdminHistory
