import React from 'react'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'

import useIsEditor from '@/hooks/useIsEditor'
import { FullAmendment } from '@/modules/amendments'
import NoResultsMessage from '@/components/no-results-message'
import AmendmentResultsItem from '@/components/amendment-results-item'
import { HydrateFn } from '@/hooks/useDataStore'

const AmendmentResults = ({
  results,
  showParentDetails = true,
  hydrate,
}: {
  results: FullAmendment<any>[]
  showParentDetails?: boolean
  hydrate?: HydrateFn
}) => {
  const isEditor = useIsEditor()
  return results.length ? (
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
            hydrate={hydrate}
          />
        ))}
      </TableBody>
    </Table>
  ) : (
    <NoResultsMessage>No amendments to display</NoResultsMessage>
  )
}

export default AmendmentResults
