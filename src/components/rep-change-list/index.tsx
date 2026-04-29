import React from 'react'
import { FullRepChange } from '@/modules/reputation'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

import NoResultsMessage from '@/components/no-results-message'
import StatusText from '@/components/status-text'
import FormattedDate from '@/components/formatted-date'
import UsernameLink from '@/components/username-link'

const RepChangeList = ({ repChanges }: { repChanges: FullRepChange[] }) => {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>ID</TableCell>
          <TableCell>User</TableCell>
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
                <UsernameLink
                  id={repChange.userid}
                  username={repChange.userusername}
                  reputation={repChange.userreputation}
                />
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
              <TableCell>
                {repChange.relateddata
                  ? JSON.stringify(repChange.relateddata)
                  : '-'}
              </TableCell>
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
