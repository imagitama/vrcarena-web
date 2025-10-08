import React from 'react'
import useDatabaseQuery, { Operators } from '@/hooks/useDatabaseQuery'
import { FullRepChange, ViewNames } from '@/modules/reputation'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material'
import NoResultsMessage from '../no-results-message'
import StatusText from '../status-text'
import FormattedDate from '../formatted-date'

const RepChangeList = ({ userId }: { userId: string }) => {
  const [isLoading, lastErrorCode, repChanges] =
    useDatabaseQuery<FullRepChange>(ViewNames.GetFullRepChanges, [
      ['userid', Operators.EQUALS, userId],
    ])

  if (isLoading || !repChanges) {
    return <LoadingIndicator message="Loading reputation..." />
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>
        Failed to load reputation changes (code {lastErrorCode})
      </ErrorMessage>
    )
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>ID</TableCell>
          <TableCell>Reason</TableCell>
          <TableCell>Delta</TableCell>
          <TableCell>Related Data</TableCell>
          <TableCell> </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {repChanges.length ? (
          repChanges.map((repChange) => (
            <TableRow key={repChange.id}>
              <TableCell title={repChange.id}>
                {repChange.id.substring(0, 5)}...
              </TableCell>
              <TableCell>
                {repChange.reason}
                <br />
                <em>{repChange.reasoninfo.description}</em>
              </TableCell>
              <TableCell>
                <StatusText positivity={repChange.delta > 0 ? 1 : -1}>
                  {repChange.delta}
                </StatusText>
              </TableCell>
              <TableCell>{JSON.stringify(repChange.relateddata)}</TableCell>
              <TableCell>
                <FormattedDate date={repChange.createdat} />
                {repChange.createdby ? (
                  <> by {repChange.createdby.substring(0, 5)}...</>
                ) : null}
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={999}>
              <NoResultsMessage>No reputation changes found</NoResultsMessage>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

export default RepChangeList
