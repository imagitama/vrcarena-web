import React from 'react'
import { makeStyles } from '@mui/styles'

import useDatabaseQuery, { Operators } from '../../hooks/useDatabaseQuery'
import { CollectionNames, Endorsement } from '../../modules/endorsements'
import EndorsementListItem from '../endorsement-list-item'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import NoResultsMessage from '../no-results-message'

const useStyles = makeStyles({
  item: {
    marginBottom: '1rem',
  },
})

const EndorsementList = ({ assetId }: { assetId: string }) => {
  if (!assetId) {
    throw new Error('Cannot render endorsement list: no asset ID')
  }

  const [isLoading, lastErrorCode, results] = useDatabaseQuery<Endorsement>(
    CollectionNames.Endorsements,
    [['asset', Operators.EQUALS, assetId]]
  )
  const classes = useStyles()

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (lastErrorCode) {
    return (
      <ErrorMessage>
        Failed to load endorsements (code {lastErrorCode})
      </ErrorMessage>
    )
  }

  if (!results || !results.length) {
    return <NoResultsMessage>No endorsements found</NoResultsMessage>
  }

  return (
    <>
      {results.map((result) => (
        <EndorsementListItem
          key={result.id}
          endorsement={result}
          className={classes.item}
        />
      ))}
    </>
  )
}

export default EndorsementList
