import React, { useState } from 'react'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'

import Link from '../../components/link'
import UsernameLink from '../username-link'
import FormattedDate from '../formatted-date'
import { FullHistoryEntry, HistoryEntry } from '../../modules/history'
import Button from '../button'

import { CollectionNames as AssetsCollectionNames } from '../../modules/assets'
import * as routes from '../../routes'

const removeUselessKeysFromChanges = (changes: any) => {
  delete changes.lastmodifiedby
  delete changes.lastmodifiedat
  delete changes.createdby
  delete changes.createdat
  return changes
}

function HistoryData({ data }: { data: any }) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!data.changes) {
    return <>No data</>
  }

  return (
    <>
      {isExpanded && (
        <div style={{ font: 'monospace' }}>
          {JSON.stringify(
            removeUselessKeysFromChanges(data.changes),
            null,
            '  '
          )}
        </div>
      )}
      {!isExpanded && (
        <Button
          onClick={() => setIsExpanded((currentVal) => !currentVal)}
          size="small"
          color="secondary">
          Toggle Data
        </Button>
      )}
    </>
  )
}

function ParentLabel({
  parentTable,
  parentId,
}: {
  parentTable: string
  parentId: string
}) {
  const collectionName = parentTable

  switch (collectionName) {
    case AssetsCollectionNames.Assets:
    case AssetsCollectionNames.AssetsMeta:
      return (
        <Link to={routes.viewAssetWithVar.replace(':assetId', parentId)}>
          {collectionName}: {parentId}
        </Link>
      )
  }

  if (parentId) {
    return (
      <>
        {collectionName}: {parentId}
      </>
    )
  }

  return <>(no parent)</>
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
      {results.map(
        ({
          id,
          message,
          parent,
          parenttable: parentTable,
          data,
          createdat: createdAt,
          createdby: createdBy,
          ...result
        }) => (
          <TableRow key={id} title={id}>
            <TableCell>
              {message}&nbsp;
              {parent ? (
                <ParentLabel parentId={parent} parentTable={parentTable} />
              ) : (
                '(no parent)'
              )}
            </TableCell>
            <TableCell>
              {data ? <HistoryData data={data} /> : '(no data)'}
            </TableCell>
            <TableCell>
              <UsernameLink
                id={createdBy}
                // @ts-ignore
                username={result.createdbyusername}
              />
            </TableCell>
            <TableCell>
              <FormattedDate date={createdAt} />
            </TableCell>
          </TableRow>
        )
      )}
    </TableBody>
  </Table>
)

export default HistoryResults
