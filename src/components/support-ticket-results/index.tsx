import React from 'react'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import SupportTicketResultsItem from '../support-ticket-results-item'
import ErrorMessage from '../error-message'
import { FullSupportTicket } from '@/modules/support-tickets'

export default ({
  supportTickets,
  showRelatedDetails = true,
  showControls = false,
  analyticsCategoryName = '',
}: {
  supportTickets: FullSupportTicket[]
  showRelatedDetails?: boolean
  showControls?: boolean
  analyticsCategoryName?: string
}) =>
  supportTickets.length ? (
    <Table>
      <TableHead>
        <TableRow>
          {showRelatedDetails && <TableCell>Parent</TableCell>}
          <TableCell>Category</TableCell>
          <TableCell>Metadata</TableCell>
          <TableCell>Status</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {supportTickets.map((supportTicket) => (
          <SupportTicketResultsItem
            key={supportTicket.id}
            supportTicket={supportTicket}
            showRelatedDetails={showRelatedDetails}
            showControls={showControls}
            analyticsCategoryName={analyticsCategoryName}
          />
        ))}
      </TableBody>
    </Table>
  ) : (
    <ErrorMessage>No support tickets</ErrorMessage>
  )
