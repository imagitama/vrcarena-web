import React, { useState } from 'react'
import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'

import Link from '../../components/link'
import UsernameLink from '../username-link'
import FormattedDate from '../formatted-date'
import { HistoryEntry } from '../../modules/history'
import Button from '../button'

import { CollectionNames as AssetsCollectionNames } from '../../modules/assets'
import * as routes from '../../routes'

function HistoryData({ data }: { data: any }) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!data.changes) {
    return <>No data</>
  }

  return (
    <>
      {isExpanded && (
        <div style={{ font: 'monospace' }}>
          {JSON.stringify(data.changes, null, '  ')}
        </div>
      )}
      {!isExpanded && (
        <Button onClick={() => setIsExpanded((currentVal) => !currentVal)}>
          View
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

  if (
    collectionName === AssetsCollectionNames.Assets ||
    collectionName === AssetsCollectionNames.AssetsMeta
  ) {
    return (
      <Link to={routes.viewAssetWithVar.replace(':assetId', parentId)}>
        {parentId}
      </Link>
    )
  }

  if (parentId) {
    return <>{parentId}</>
  }

  return <>(none)</>
}

const HistoryResults = ({ results }: { results: HistoryEntry[] }) => (
  <Paper>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Message</TableCell>
          <TableCell>Data</TableCell>
          <TableCell>Logged By</TableCell>
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
          }) => (
            <TableRow key={id} title={id}>
              <TableCell>
                {message}
                <br />
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
                <UsernameLink id={createdBy} username={createdBy} />
              </TableCell>
              <TableCell>
                <FormattedDate date={createdAt} />
              </TableCell>
            </TableRow>
          )
        )}
      </TableBody>
    </Table>
  </Paper>
)

export default HistoryResults
