import React from 'react'
import Table from '@/components/responsive-table'
import TableBody from '@mui/material/TableBody'
import { TableCell } from '@/components/responsive-table'
import { TableHead } from '@/components/responsive-table'
import { TableRow } from '@/components/responsive-table'

import useDatabaseQuery, { Operators } from '@/hooks/useDatabaseQuery'
import { FullRepChange, ViewNames } from '@/modules/reputation'

import ErrorMessage from '@/components/error-message'
import LoadingIndicator from '@/components/loading-indicator'
import NoResultsMessage from '@/components/no-results-message'
import StatusText from '@/components/status-text'
import FormattedDate from '@/components/formatted-date'
import useIsEditor from '@/hooks/useIsEditor'
import { getShortId } from '@/utils/formatting'
import ShortId from '../short-id'

const getReasonLabel = (reason: string): string =>
  `${reason.substring(0, 1).toUpperCase()}${reason
    .substring(1)
    .replaceAll('_', ' ')}`

const RepChangeForUser = ({ userId }: { userId: string }) => {
  const [isLoading, lastErrorCode, repChanges] =
    useDatabaseQuery<FullRepChange>(ViewNames.GetFullRepChanges, [
      ['userid', Operators.EQUALS, userId],
    ])
  const isEditor = useIsEditor()

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
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell></TableCell>
          <TableCell>Reason</TableCell>
          <TableCell>Delta</TableCell>
          {isEditor && <TableCell>Related Data</TableCell>}
          <TableCell>Date</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {repChanges.length ? (
          repChanges.map((repChange) => (
            <TableRow key={repChange.id}>
              <TableCell title={repChange.id}>
                <ShortId>{repChange.id}</ShortId>
              </TableCell>
              <TableCell label="Reason">
                {getReasonLabel(repChange.reason)}
                <br />
                <em>{repChange.reasoninfo.description}</em>
              </TableCell>
              <TableCell label="Delta">
                <StatusText positivity={repChange.delta > 0 ? 1 : -1}>
                  +{repChange.delta}
                </StatusText>
              </TableCell>
              {isEditor && (
                <TableCell label="Related Data">
                  {repChange.relateddata
                    ? JSON.stringify(repChange.relateddata)
                    : '-'}
                </TableCell>
              )}
              <TableCell label="Date">
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

export default RepChangeForUser
