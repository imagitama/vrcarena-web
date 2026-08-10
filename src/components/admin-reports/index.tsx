import React, { useCallback } from 'react'
import Table from '@/components/responsive-table'
import TableBody from '@mui/material/TableBody'
import { TableCell } from '@/components/responsive-table'
import { TableHead } from '@/components/responsive-table'
import { TableRow } from '@/components/responsive-table'

import * as routes from '@/routes'
import { FullReport, ResolutionStatus, ViewNames } from '@/modules/reports'
import { FilterSubType, FilterType } from '@/filters'

import PaginatedView, { GetQueryFn } from '@/components/paginated-view'
import FormattedDate from '@/components/formatted-date'
import GenericOutputItem from '@/components/generic-output-item'
import ResolutionStatusOutput from '@/components/resolution-status'
import UsernameLink from '@/components/username-link'
import ShortId from '../short-id'
import InfoMessage from '../info-message'
import Link from '../link'
import Heading from '../heading'

function ReportsTable({ reports }: { reports?: FullReport[] }) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell />
          <TableCell>Reason</TableCell>
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
                  <ShortId
                    url={routes.viewReportWithVar.replace(':reportId', id)}>
                    {id}
                  </ShortId>
                </TableCell>
                <TableCell label="Reason">{reason || '-'}</TableCell>
                <TableCell label="Parent">
                  <GenericOutputItem
                    type={parenttable}
                    id={parent}
                    data={parentdata}
                  />
                </TableCell>
                <TableCell label="Metadata">
                  <FormattedDate date={createdAt} /> by{' '}
                  <UsernameLink id={createdBy} username={createdByUsername} />
                </TableCell>
                <TableCell label="Status">
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

enum SubView {
  Pending = 'pending',
  Resolved = 'resolved',
}

export default () => {
  const getQuery = useCallback<GetQueryFn<FullReport, SubView>>(
    (query, selectedSubView) => {
      switch (selectedSubView) {
        case SubView.Pending:
          query = query.eq('resolutionstatus', ResolutionStatus.Pending)
          break
        case SubView.Resolved:
          query = query.eq('resolutionstatus', ResolutionStatus.Resolved)
          break
      }

      return query
    },
    []
  )

  return (
    <>
      <Heading variant="h1">Reports</Heading>
      <InfoMessage title="How Reports Work" hideId="admin-reports-info">
        Anyone can report anything on the site. Try your best to verify their
        claim and resolve the report.
        <br />
        <br />
        <strong>Removing assets:</strong> We have a strict{' '}
        <Link to={routes.takedownPolicy}>Takedown Policy</Link> they need to
        follow. 9 out of 10 times they should submit a DMCA claim. Sometimes
        they take down the asset from their Gumroad page etc. and it needs to be
        archived here too.
      </InfoMessage>
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
        urlWithSubViewNameAndPageNumberVar={routes.adminWithTabNameVarAndPageNumberVar.replace(
          ':tabName',
          'reports'
        )}
        getQuery={getQuery}
        subViews={[
          {
            id: SubView.Pending,
            label: 'Pending',
          },
          {
            id: SubView.Resolved,
            label: 'Resolved',
          },
        ]}
        defaultSubView={SubView.Pending}
        filters={[
          {
            fieldName: 'createdby',
            label: 'Reporter',
            type: FilterType.Equal,
            subType: FilterSubType.UserId,
          },
        ]}
        itemNamePlural="reports">
        <Renderer />
      </PaginatedView>
    </>
  )
}
