import React from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

import * as routes from '@/routes'
import {
  FullSupportTicket,
  ResolutionStatus,
  ViewNames,
} from '@/modules/support-tickets'

import PaginatedView from '@/components/paginated-view'
import FormattedDate from '@/components/formatted-date'
import GenericOutputItem from '@/components/generic-output-item'
import ResolutionStatusOutput from '@/components/resolution-status'
import Link from '@/components/link'
import UsernameLink from '@/components/username-link'
import { FilterSubType, FilterType, MultichoiceFilter } from '@/filters'

function SupportTicketsTable({
  supportTickets,
}: {
  supportTickets?: FullSupportTicket[]
}) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell />
          <TableCell>Related</TableCell>
          <TableCell>Metadata</TableCell>
          <TableCell>Status</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {supportTickets ? (
          supportTickets.map((report) => {
            const {
              id,
              relatedtable: relatedTable,
              relatedid: relatedId,
              category,
              guestid: guestId,
              createdat: createdAt,
              createdby: createdBy,
              // meta
              resolutionstatus: resolutionStatus,
              resolvedat: resolvedAt,
              resolvedby: resolvedBy,
              // view
              relateddata: relatedData,
              createdbyusername: createdByUsername,
              resolvedbyusername: resolvedByUsername,
            } = report
            return (
              <TableRow key={id}>
                <TableCell>
                  <Link to={routes.viewReportWithVar.replace(':reportId', id)}>
                    View Support Ticket
                  </Link>
                  <br />
                  <br />
                  Category: {category}
                </TableCell>
                <TableCell>
                  <GenericOutputItem
                    type={relatedTable}
                    id={relatedId}
                    data={relatedData}
                  />
                </TableCell>
                <TableCell>
                  <FormattedDate date={createdAt} /> by{' '}
                  <UsernameLink id={createdBy} username={createdByUsername} />
                </TableCell>
                <TableCell>
                  <ResolutionStatusOutput
                    resolutionStatus={resolutionStatus}
                    resolvedAt={resolvedAt}
                    resolvedBy={resolvedBy}
                    resolvedByUsername={resolvedByUsername}
                  />
                </TableCell>
              </TableRow>
            )
          })
        ) : (
          <TableRow>
            <TableCell>Loading...</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

const Renderer = ({ items }: { items?: FullSupportTicket[] }) => (
  <SupportTicketsTable supportTickets={items} />
)

export default () => {
  return (
    <PaginatedView<FullSupportTicket>
      viewName={ViewNames.GetFullSupportTickets}
      name="view-support-tickets"
      sortOptions={[
        {
          label: 'Resolved at',
          fieldName: 'resolvedat',
        },
        {
          label: 'Reported at',
          fieldName: 'createdat',
        },
      ]}
      defaultFieldName={'createdat'}
      urlWithPageNumberVar={routes.adminWithTabNameVarAndPageNumberVar.replace(
        ':tabName',
        'support-tickets'
      )}
      filters={[
        {
          fieldName: 'resolutionstatus',
          type: FilterType.Multichoice,
          options: [ResolutionStatus.Pending, ResolutionStatus.Resolved],
          label: 'Status',
          defaultActive: true,
          defaultValue: [ResolutionStatus.Pending],
        } as MultichoiceFilter<FullSupportTicket, ResolutionStatus>,
        {
          fieldName: 'createdby',
          label: 'Created By',
          type: FilterType.Equal,
          subType: FilterSubType.UserId,
        },
      ]}>
      <Renderer />
    </PaginatedView>
  )
}
