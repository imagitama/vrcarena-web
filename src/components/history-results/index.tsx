import React, { useState } from 'react'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import styled from '@emotion/styled'

import { FullHistoryEntry, HistoryEntry } from '@/modules/history'
import { getMessageLabel } from '@/history'
import { getUrlForParent } from '@/relations'

import UsernameLink from '@/components/username-link'
import FormattedDate from '@/components/formatted-date'
import Link from '@/components/link'

import { getParentLabel } from '@/data-store'
import HistoryEntryLabel from '@/components/history-entry-label'
import ToggleIcon from '../toggle-icon'
import FieldOutput from '../field-output'
import { getEditableField, getLabelForFieldName } from '@/editable-fields'
import Tooltip from '../tooltip'
import CopyThing from '../copy-thing'
import { getShortId } from '@/utils/formatting'
import LabelWithIcon from '../label-with-icon'

const ExpandedData = ({
  parentType,
  data,
}: {
  parentType: string
  data: any
}) => {
  if (!data) return '(no data)'
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
            <TableCell>
              {getLabelForFieldName(fieldName, parentType) || fieldName}
            </TableCell>
            <TableCell>
              <FieldOutput
                editableField={
                  getEditableField(fieldName, parentType) || undefined
                }>
                {value}
              </FieldOutput>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function MessageLabel({ entry }: { entry: HistoryEntry }) {
  const url = getUrlForParent(entry.parenttable, entry.parent)
  const label = getParentLabel(entry.parenttable, entry.parent)
  return (
    <span
      title={`${entry.id} ${entry.message} ${entry.parenttable} ${entry.parent}`}>
      {getMessageLabel(entry)} {url ? <Link to={url}>{label}</Link> : label}
    </span>
  )
}

const HistoryEntryTableRow = styled(TableRow)`
  ${({ isHighlighted }: { isHighlighted: boolean }) =>
    isHighlighted
      ? `
    border: 1px dashed rgb(255, 255, 0);
    padding: 0.25rem;
  `
      : ''}
`

const HistoryResultsItem = ({
  entry,
  isHighlighted = false,
  isExpanded: overrideIsExpanded,
}: {
  entry: HistoryEntry<any>
  isHighlighted?: boolean
  isExpanded?: boolean
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(
    overrideIsExpanded !== undefined ? overrideIsExpanded : false
  )
  return (
    <HistoryEntryTableRow isHighlighted={isHighlighted}>
      <TableCell>
        <CopyThing text={entry.id} title={entry.id}>
          #{getShortId(entry.id)}
        </CopyThing>
        <br />
        <MessageLabel entry={entry} />
      </TableCell>
      <TableCell>
        <LabelWithIcon>
          {entry.data ? <HistoryEntryLabel entry={entry} /> : '(no data)'}{' '}
          <ToggleIcon
            isExpanded={isExpanded || overrideIsExpanded === true}
            onClick={() => setIsExpanded((val) => !val)}
          />
        </LabelWithIcon>
        {entry.data && (isExpanded || overrideIsExpanded === true) ? (
          <ExpandedData
            parentType={entry.parenttable}
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
    </HistoryEntryTableRow>
  )
}

const HistoryResults = ({
  results,
  highlightedEntryId,
  isAllExpanded,
}: {
  results: (FullHistoryEntry | HistoryEntry)[]
  highlightedEntryId?: string
  isAllExpanded?: boolean
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
      {results.map((entry) => (
        <HistoryResultsItem
          key={entry.id}
          entry={entry}
          isHighlighted={entry.id === highlightedEntryId}
          isExpanded={isAllExpanded}
        />
      ))}
    </TableBody>
  </Table>
)

export default HistoryResults
