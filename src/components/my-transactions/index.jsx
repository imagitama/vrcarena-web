import React from 'react'

import useDatabaseQuery, {
  CollectionNames,
  TransactionFieldNames,
  Operators,
  options,
  OrderDirections
} from '../../hooks/useDatabaseQuery'
import useUserId from '../../hooks/useUserId'

import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import NoResultsMessage from '../../components/no-results-message'
import TransactionsList from '../../components/transactions-list'

import { createRef } from '../../utils'

export default () => {
  const userId = useUserId()
  const [isLoading, isError, results] = useDatabaseQuery(
    CollectionNames.Transactions,
    [
      [
        TransactionFieldNames.customer,
        Operators.EQUALS,
        createRef(CollectionNames.Users, userId)
      ]
    ],
    {
      [options.orderBy]: [TransactionFieldNames.createdAt, OrderDirections.DESC]
    }
  )

  if (isLoading) {
    return <LoadingIndicator message="Loading your transactions..." />
  }

  if (isError) {
    return <ErrorMessage>Failed to load your transactions</ErrorMessage>
  }

  if (!results) {
    return null
  }

  if (!results.length) {
    return <NoResultsMessage />
  }

  return <TransactionsList transactions={results} />
}
