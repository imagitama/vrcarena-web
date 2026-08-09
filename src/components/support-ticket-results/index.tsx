import React from 'react'
import Table from '@/components/responsive-table'
import { TableHead } from '@/components/responsive-table'
import TableBody from '@mui/material/TableBody'
import { TableCell } from '@/components/responsive-table'
import { TableRow } from '@/components/responsive-table'

import { FullSupportTicket } from '@/modules/support-tickets'

import SupportTicketResultsItem from '@/components/support-ticket-results-item'
import ErrorMessage from '@/components/error-message'

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
          <TableCell />
          {showRelatedDetails && <TableCell>Parent</TableCell>}
          <TableCell>Category</TableCell>
          <TableCell>Created</TableCell>
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
