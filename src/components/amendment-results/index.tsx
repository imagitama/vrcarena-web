import React from 'react'
import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import AmendmentResultsItem from '../amendment-results-item'
import ErrorMessage from '../error-message'
import useIsEditor from '../../hooks/useIsEditor'
import { FullAmendment } from '../../modules/amendments'

export default ({
  results,
  showParentDetails = true
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
          {results.map(result => (
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
