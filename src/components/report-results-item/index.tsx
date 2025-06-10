import React, { Fragment } from 'react'
import Link from '../../components/link'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'

import * as routes from '../../routes'
import WarningMessage from '../../components/warning-message'

import FormattedDate from '../formatted-date'
import {
  FullReport,
  reportReasonsKeysByCollection,
} from '../../modules/reports'
import GenericOutputItem from '../generic-output-item'
import ResolutionStatus from '../resolution-status'
import { CollectionNames } from '../../modules/assets'
import Button from '../button'

export default ({
  report,
  showParentDetails = true,
  analyticsCategoryName = '',
}: {
  report: FullReport
  showParentDetails?: boolean
  showControls?: boolean
  analyticsCategoryName?: string
}) => {
  const {
    id: reportId,
    parenttable,
    parent,
    reason,
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
  } = report

  return (
    <Fragment key={reportId}>
      <TableRow key={reportId} title={reportId}>
        <TableCell>
          <Button
            url={routes.viewReportWithVar.replace(':reportId', reportId)}
            color="secondary">
            View Report
          </Button>
        </TableCell>
        {showParentDetails && (
          <TableCell>
            <GenericOutputItem
              type={parenttable}
              id={parent}
              data={parentdata}
            />
          </TableCell>
        )}
        <TableCell>
          {reason}
          {reason ===
            reportReasonsKeysByCollection[CollectionNames.Assets].TAKEDOWN && (
            <WarningMessage>
              Please ensure this report aligns with our{' '}
              <Link to={routes.takedownPolicy}>takedown policy</Link>.
            </WarningMessage>
          )}
        </TableCell>
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
