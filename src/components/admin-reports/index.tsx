import React, { useState, useCallback } from 'react'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import Paper from '@material-ui/core/Paper'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import { PostgrestFilterBuilder } from '@supabase/postgrest-js'

import * as routes from '../../routes'
import { trackAction } from '../../analytics'
import { FullReport, ResolutionStatus } from '../../modules/reports'

import Button from '../button'
import PaginatedView from '../paginated-view'
import TextInput from '../text-input'
import FormattedDate from '../formatted-date'
import GenericOutputItem from '../generic-output-item'
import ResolutionStatusOutput from '../resolution-status'
import Link from '../link'
import UsernameLink from '../username-link'
import { GetQuery } from '../../data-store'

function ReportsTable({
  reports,
  hydrate,
}: {
  reports?: FullReport[]
  hydrate?: () => void
}) {
  return (
    <Paper>
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
            reports.map((asset) => {
              const {
                id,
                parenttable,
                parent,
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
              } = asset
              return (
                <TableRow key={id}>
                  <TableCell>
                    <Link
                      to={routes.viewReportWithVar.replace(':reportId', id)}>
                      View Report
                    </Link>
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
    </Paper>
  )
}

const Renderer = ({
  items,
  hydrate,
}: {
  items?: FullReport[]
  hydrate?: () => void
}) => <ReportsTable reports={items} hydrate={hydrate} />

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
      viewName="getFullReports"
      getQuery={getQuery}
      sortKey="view-reports"
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
          color="default">
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
          color="default">
          Resolved
        </Button>,
        <UserIdFilter onChange={(newVal) => setUserIdToFilter(newVal)} />,
      ]}>
      <Renderer />
    </PaginatedView>
  )
}
