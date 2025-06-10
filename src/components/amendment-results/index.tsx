import React from 'react'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'

import AmendmentResultsItem from '../amendment-results-item'
import ErrorMessage from '../error-message'
import useIsEditor from '../../hooks/useIsEditor'
import { FullAmendment } from '../../modules/amendments'

export default ({
  results,
  showParentDetails = true,
}: {
  results: FullAmendment[]
  showParentDetails?: boolean
}) => {
  const isEditor = useIsEditor()
  return results.length ? (
    <Paper>
      <Table>
        <TableHead>
          <TableRow>
            {showParentDetails && <TableCell>Parent</TableCell>}
            <TableCell />
            <TableCell>Meta</TableCell>
            {isEditor ? <TableCell>Status</TableCell> : null}
          </TableRow>
        </TableHead>
        <TableBody>
          {results.map((result) => (
            <AmendmentResultsItem
              key={result.id}
              result={result}
              showParentDetails={showParentDetails}
            />
          ))}
        </TableBody>
      </Table>
    </Paper>
  ) : (
    <ErrorMessage>No results</ErrorMessage>
  )
}
