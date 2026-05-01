import React, { useState } from 'react'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'

import { FullHistoryEntry, HistoryEntry } from '@/modules/history'
import { getMessageLabel } from '@/history'
import { getLinkUrl } from '@/notifications'

import UsernameLink from '@/components/username-link'
import FormattedDate from '@/components/formatted-date'
import Link from '@/components/link'

import { getParentLabel } from '@/data-store'
import HistoryEntryLabel from '@/components/history-entry-label'
import ToggleIcon from '../toggle-icon'

const ExpandedData = ({ data }: { data: any }) => {
  return (
    <Table padding="none">
      <TableHead>
        <TableRow>
          <TableCell>Field</TableCell>
          <TableCell>Value</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {Object.entries(data).map(([fieldName, value]) => (
          <TableRow key={fieldName}>
            <TableCell>{fieldName}</TableCell>
            <TableCell>{JSON.stringify(value, null, '  ')}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function MessageLabel({ entry }: { entry: HistoryEntry }) {
  const url = getLinkUrl(entry)
  const label = getParentLabel(entry.parenttable, entry.parent)
  return (
    <span
      title={`${entry.id} ${entry.message} ${entry.parenttable} ${entry.parent}`}>
      {getMessageLabel(entry)} {url ? <Link to={url}>{label}</Link> : label}
    </span>
  )
}

const HistoryResultsItem = ({ entry }: { entry: HistoryEntry<any> }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  return (
    <TableRow>
      <TableCell>
        <MessageLabel entry={entry} />
      </TableCell>
      <TableCell>
        {entry.data ? <HistoryEntryLabel entry={entry} /> : '(no data)'}{' '}
        <ToggleIcon
          isExpanded={isExpanded}
          onClick={() => setIsExpanded((val) => !val)}
        />
        {entry.data && isExpanded ? (
          <ExpandedData
            data={
              'changes' in entry.data ? entry.data.changes : entry.data.record
            }
          />
        ) : null}
      </TableCell>
      <TableCell>
        {'createdbyusername' in entry && entry.createdbyusername ? (
          <UsernameLink
            id={entry.createdby}
            // @ts-ignore
            username={entry.createdbyusername}
          />
        ) : (
          'System'
        )}
      </TableCell>
      <TableCell>
        <FormattedDate date={entry.createdat} />
      </TableCell>
    </TableRow>
  )
}

const HistoryResults = ({
  results,
}: {
  results: (FullHistoryEntry | HistoryEntry)[]
}) => (
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>Message</TableCell>
        <TableCell>Data</TableCell>
        <TableCell>Performed By</TableCell>
        <TableCell>Date</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {results.map((entry) => {
        const { id, data, createdat: createdAt, createdby: createdBy } = entry
        return <HistoryResultsItem key={entry.id} entry={entry} />
      })}
    </TableBody>
  </Table>
)

export default HistoryResults
