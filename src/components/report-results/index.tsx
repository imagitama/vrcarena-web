import React from 'react'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'

import { FullReport } from '@/modules/reports'
import ReportResultsItem from '@/components/report-results-item'
import ErrorMessage from '@/components/error-message'

export default ({
  reports,
  showParentDetails = true,
  showControls = false,
  analyticsCategoryName = '',
}: {
  reports: FullReport[]
  showParentDetails?: boolean
  showControls?: boolean
  analyticsCategoryName?: string
}) =>
  reports.length ? (
    <Table>
      <TableHead>
        <TableRow>
          {showParentDetails && <TableCell>Parent</TableCell>}
          <TableCell>Reason</TableCell>
          <TableCell>Metadata</TableCell>
          <TableCell>Status</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {reports.map((report) => (
          <ReportResultsItem
            key={report.id}
            report={report}
            showParentDetails={showParentDetails}
            showControls={showControls}
            analyticsCategoryName={analyticsCategoryName}
          />
        ))}
      </TableBody>
    </Table>
  ) : (
    <ErrorMessage>No reports</ErrorMessage>
  )
