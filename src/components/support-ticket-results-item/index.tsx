import React, { Fragment } from 'react'
import { TableCell } from '@/components/responsive-table'
import { TableRow } from '@/components/responsive-table'

import * as routes from '@/routes'
import { FullSupportTicket } from '@/modules/support-tickets'

import Link from '@/components/link'
import FormattedDate from '@/components/formatted-date'
import GenericOutputItem from '@/components/generic-output-item'
import ResolutionStatus from '@/components/resolution-status'
import ShortId from '@/components/short-id'

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
        <TableCell title={supportTicketId}>
          <ShortId
            url={routes.viewSupportTicketWithVar.replace(
              ':supportTicketId',
              supportTicketId
            )}>
            {supportTicketId}
          </ShortId>
        </TableCell>
        {showRelatedDetails && (
          <TableCell label="Parent">
            {relatedTable && relatedId ? (
              <GenericOutputItem
                type={relatedTable}
                id={relatedId}
                data={parentdata}
              />
            ) : (
              '-'
            )}
          </TableCell>
        )}
        <TableCell label="Category">{category}</TableCell>
        <TableCell label="Created">
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
        <TableCell label="Status">
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
