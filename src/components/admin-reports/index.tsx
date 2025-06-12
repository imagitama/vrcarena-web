import React, { useState, useCallback } from 'react'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

import * as routes from '../../routes'
import { trackAction } from '../../analytics'
import { FullReport, ResolutionStatus, ViewNames } from '../../modules/reports'

import Button from '../button'
import PaginatedView from '../paginated-view'
import TextInput from '../text-input'
import FormattedDate from '../formatted-date'
import GenericOutputItem from '../generic-output-item'
import ResolutionStatusOutput from '../resolution-status'
import Link from '../link'
import UsernameLink from '../username-link'
import { GetQuery } from '../../data-store'

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

const subViews = {
  PENDING: 0,
  RESOLVED: 1,
}

const analyticsCategoryName = 'AdminReports'

const UserIdFilter = ({ onChange }: { onChange: (userId: string) => void }) => {
  const [val, setVal] = useState('')
  return (
    <>
      <TextInput
        onChange={(e) => setVal(e.target.value)}
        value={val}
        placeholder="User ID"
        size="small"
      />
      <Button onClick={() => onChange(val)}>Apply</Button>
    </>
  )
}

export default () => {
  const [selectedSubView, setSelectedSubView] = useState(subViews.PENDING)
  const [userIdToFilter, setUserIdToFilter] = useState('')
  const getQuery = useCallback(
    (query: GetQuery<FullReport>): GetQuery<FullReport> => {
      if (userIdToFilter) {
        query = query.eq('createdby', userIdToFilter)
      }

      switch (selectedSubView) {
        case subViews.PENDING:
          query = query.eq('resolutionstatus', ResolutionStatus.Pending)
          break

        case subViews.RESOLVED:
          query = query.eq('resolutionstatus', ResolutionStatus.Resolved)
          break
      }

      return query
    },
    [userIdToFilter, selectedSubView]
  )

  const toggleSubView = (subView: number) =>
    setSelectedSubView((currentVal) => {
      if (currentVal === subView) {
        return subViews.PENDING
      }
      return subView
    })

  return (
    <PaginatedView<FullReport>
      viewName={ViewNames.GetFullReports}
      getQuery={getQuery}
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
      extraControls={[
        <Button
          icon={
            selectedSubView === subViews.PENDING ? (
              <CheckBoxIcon />
            ) : (
              <CheckBoxOutlineBlankIcon />
            )
          }
          onClick={() => {
            setSelectedSubView(subViews.PENDING)
            trackAction(analyticsCategoryName, 'Click on view waiting reports')
          }}
          color="secondary">
          Pending
        </Button>,
        <Button
          icon={
            selectedSubView === subViews.RESOLVED ? (
              <CheckBoxIcon />
            ) : (
              <CheckBoxOutlineBlankIcon />
            )
          }
          onClick={() => {
            toggleSubView(subViews.RESOLVED)
            trackAction(analyticsCategoryName, 'Click on view resolved reports')
          }}
          color="secondary">
          Resolved
        </Button>,
        <UserIdFilter onChange={(newVal) => setUserIdToFilter(newVal)} />,
      ]}>
      <Renderer />
    </PaginatedView>
  )
}
