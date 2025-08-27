import React, { Fragment } from 'react'
import Link from '@/components/link'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'

import * as routes from '@/routes'

import FormattedDate from '../formatted-date'
import { FullSupportTicket } from '@/modules/support-tickets'
import GenericOutputItem from '../generic-output-item'
import ResolutionStatus from '../resolution-status'
import Button from '../button'

export default ({
  supportTicket,
  showRelatedDetails = true,
  analyticsCategoryName = '',
}: {
  supportTicket: FullSupportTicket
  showRelatedDetails?: boolean
  showControls?: boolean
  analyticsCategoryName?: string
}) => {
  const {
    id: supportTicketId,
    relatedtable: relatedTable,
    relatedid: relatedId,
    category,
    guestid: guestId,

    createdat,
    createdby,

    // meta
    resolutionstatus: resolutionStatus,
    resolvedat: resolvedAt,
    resolvedby: resolvedBy,

    // view
    parentdata,
    createdbyusername: createdByUsername,
    resolvedbyusername: resolvedByUsername,
  } = supportTicket

  return (
    <Fragment key={supportTicketId}>
      <TableRow key={supportTicketId} title={supportTicketId}>
        <TableCell>
          <Button
            url={routes.viewSupportTicketWithVar.replace(
              ':supportTicketId',
              supportTicketId
            )}
            color="secondary">
            View Support Ticket
          </Button>
        </TableCell>
        {showRelatedDetails && relatedTable && relatedId && (
          <TableCell>
            <GenericOutputItem
              type={relatedTable}
              id={relatedId}
              data={parentdata}
            />
          </TableCell>
        )}
        <TableCell>{category}</TableCell>
        <TableCell>
          <FormattedDate date={createdat} />{' '}
          {createdByUsername ? (
            <>
              by{' '}
              <Link to={routes.viewUserWithVar.replace(':userId', createdby)}>
                {createdByUsername}
              </Link>
            </>
          ) : null}
        </TableCell>
        <TableCell>
          <ResolutionStatus
            resolutionStatus={resolutionStatus}
            resolvedAt={resolvedAt}
            resolvedBy={resolvedBy}
            resolvedByUsername={resolvedByUsername}
          />
        </TableCell>
      </TableRow>
    </Fragment>
  )
}
