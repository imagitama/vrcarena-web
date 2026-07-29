import React from 'react'
import moment from 'moment'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'

import DateTimeInput from '@/components/datetime-input'

const DateInput = ({
  value,
  onChange,
}: {
  value: string
  onChange: (newValue: string) => void
}) => {
  return (
    <div>
      <DateTimeInput value={value} onChange={onChange} />{' '}
      {value && (
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell>UTC</TableCell>
              <TableCell>
                {moment.utc(value).format('YYYY-MM-DD HH:mm:ss')}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Local</TableCell>
              <TableCell>
                {new Date(value).toDateString()}{' '}
                {new Date(value).toTimeString()}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )}
    </div>
  )
}

export default DateInput
