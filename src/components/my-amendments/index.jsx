import React from 'react'

import useDatabaseQuery, {
  Operators,
  options,
  OrderDirections
} from '../../hooks/useDatabaseQuery'
import useUserId from '../../hooks/useUserId'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import AmendmentResults from '../amendment-results'
import Heading from '../heading'
import { CommonFieldNames } from '../../data-store'

export default () => {
  const userId = useUserId()
  const [isLoading, isErrored, results] = useDatabaseQuery(
    'getFullAmendments'.toLowerCase(),
    [[CommonFieldNames.createdBy, Operators.EQUALS, userId]],
    {
      [options.orderBy]: [CommonFieldNames.createdAt, OrderDirections.DESC]
    }
  )

  if (isLoading || !results) {
    return <LoadingIndicator message="Loading amendments..." />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to load amendments</ErrorMessage>
  }

  return (
    <>
      <Heading variant="h3">My Amendments</Heading>
      <AmendmentResults results={results} />
    </>
  )
}
