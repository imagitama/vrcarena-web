import HistoryIcon from '@mui/icons-material/History'

import {
  HistoryEntry,
  CollectionNames as HistoryCollectionNames,
} from '@/modules/history'
import HistoryRevisions from '@/components/history-revisions'
import LoadingIndicator from '@/components/loading-indicator'
import useDatabaseQuery, {
  Operators,
  OrderDirections,
} from '@/hooks/useDatabaseQuery'
import { CollectionNames, Page } from '@/modules/pages'
import ErrorMessage from '@/components/error-message'
import NoResultsMessage from '@/components/no-results-message'
import { useState } from 'react'
import FormControls from '@/components/form-controls'
import Button from '@/components/button'

const PageHistoryOutput = ({ pageName }: { pageName: string }) => {
  const [isLoading, lastErrorCode, entries] = useDatabaseQuery<HistoryEntry>(
    HistoryCollectionNames.History,
    [
      ['parenttable', Operators.EQUALS, CollectionNames.Pages],
      ['parent', Operators.EQUALS, pageName],
    ],
    undefined,
    ['createdat', OrderDirections.ASC]
  )

  if (isLoading) {
    return <LoadingIndicator message="Loading history..." />
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>Failed to load history (code {lastErrorCode})</ErrorMessage>
    )
  }

  if (!entries || !entries.length) {
    return <NoResultsMessage>No history entries found</NoResultsMessage>
  }

  return <HistoryRevisions<Page> entries={entries} fieldNameToDiff="content" />
}

const History = ({ pageName }: { pageName: string }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <>
      <FormControls>
        <Button
          icon={<HistoryIcon />}
          onClick={() => setIsExpanded(!isExpanded)}
          color="secondary">
          View Revision History
        </Button>
      </FormControls>
      {isExpanded && <PageHistoryOutput pageName={pageName} />}
    </>
  )
}

export default History
