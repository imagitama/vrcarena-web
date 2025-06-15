import React from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

import * as routes from '../../routes'
import { FullReport, ResolutionStatus, ViewNames } from '../../modules/reports'

import PaginatedView from '../paginated-view'
import FormattedDate from '../formatted-date'
import GenericOutputItem from '../generic-output-item'
import ResolutionStatusOutput from '../resolution-status'
import Link from '../link'
import UsernameLink from '../username-link'
import { FilterSubType, FilterType, MultichoiceFilter } from '../../filters'

function ReportsTable({ reports }: { reports?: FullReport[] }) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell />
          <TableCell>Parent</TableCell>
          <TableCell>Metadata</TableCell>
          <TableCell>Status</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {reports ? (
          reports.map((report) => {
            const {
              id,
              parenttable,
              parent,
              reason,
              createdat: createdAt,
              createdby: createdBy,
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
              <TableRow key={id}>
                <TableCell>
                  <Link to={routes.viewReportWithVar.replace(':reportId', id)}>
                    View Report
                  </Link>
                  <br />
                  <br />
                  Reason: {reason}
                </TableCell>
                <TableCell>
                  <GenericOutputItem
                    type={parenttable}
                    id={parent}
                    data={parentdata}
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

const Renderer = ({ items }: { items?: FullReport[] }) => (
  <ReportsTable reports={items} />
)

export default () => {
  return (
    <PaginatedView<FullReport>
      viewName={ViewNames.GetFullReports}
      name="view-reports"
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
        'reports'
      )}
      filters={[
        {
          fieldName: 'resolutionstatus',
          type: FilterType.Multichoice,
          options: [ResolutionStatus.Pending, ResolutionStatus.Resolved],
          label: 'Status',
          defaultActive: true,
          defaultValue: [ResolutionStatus.Pending],
        } as MultichoiceFilter<FullReport, ResolutionStatus>,
        {
          fieldName: 'createdby',
          label: 'Reporter',
          type: FilterType.Equal,
          subType: FilterSubType.UserId,
        },
      ]}>
      <Renderer />
    </PaginatedView>
  )
}
