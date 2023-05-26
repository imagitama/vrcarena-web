import React, { useState } from 'react'
import Link from '../../components/link'
import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'

import FormattedDate from '../formatted-date'
import ErrorMessage from '../error-message'
import LoadingIndicator from '../loading-indicator'
import NoResultsMessage from '../no-results-message'
import Heading from '../heading'
import Button from '../button'

import useDatabaseQuery, {
  CollectionNames,
  HistoryFieldNames,
  OrderDirections,
  Operators,
  options
} from '../../hooks/useDatabaseQuery'
import * as routes from '../../routes'
import UsernameLink from '../username-link'
import { HistoryEntry } from '../../modules/history'

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
        <Button onClick={() => setIsExpanded(currentVal => !currentVal)}>
          View
        </Button>
      )}
    </>
  )
}

function ParentLabel({
  parentTable,
  parentId
}: {
  parentTable: string
  parentId: string
}) {
  const collectionName = parentTable

  if (
    collectionName === CollectionNames.Assets ||
    collectionName === CollectionNames.AssetMeta
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

const Results = ({ results }: { results: HistoryEntry[] }) => (
  <Paper>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Message</TableCell>
          <TableCell>Data</TableCell>
          <TableCell>User</TableCell>
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
            createdby: createdBy
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

const History = ({
  id,
  type,
  limit
}: {
  id: string
  type: string
  limit: number
}) => {
  const [isLoading, isErrored, results] = useDatabaseQuery<HistoryEntry>(
    'getAllHistory',
    id
      ? [
          [HistoryFieldNames.parent, Operators.EQUALS, id],
          [HistoryFieldNames.parentTable, Operators.EQUALS, type]
        ]
      : false,
    {
      [options.limit]: limit,
      [options.orderBy]: [HistoryFieldNames.createdAt, OrderDirections.DESC],
      [options.queryName]: 'admin-history'
    }
  )

  if (isLoading || !results || !Array.isArray(results)) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to retrieve history</ErrorMessage>
  }

  if (!results.length) {
    return <NoResultsMessage>No history found</NoResultsMessage>
  }

  return <Results results={results} />
}

const MetaHistory = ({
  id,
  type,
  limit
}: {
  id: string
  type: string
  limit: number
}) => {
  const [isLoading, isErrored, results] = useDatabaseQuery<HistoryEntry>(
    'getAllHistory',
    id
      ? [
          [HistoryFieldNames.parent, Operators.EQUALS, id],
          [HistoryFieldNames.parentTable, Operators.EQUALS, type]
        ]
      : [],
    {
      [options.limit]: limit,
      [options.orderBy]: [HistoryFieldNames.createdAt, OrderDirections.DESC],
      [options.queryName]: 'admin-history'
    }
  )

  if (isLoading || !results || !Array.isArray(results)) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to retrieve history</ErrorMessage>
  }

  if (!results.length) {
    return <NoResultsMessage>No history found</NoResultsMessage>
  }

  return <Results results={results} />
}

export default ({
  id,
  type,
  metaType,
  limit = 20
}: {
  id: string
  type: string
  metaType: string
  limit?: number
}) => {
  return (
    <>
      <Heading variant="h3">Basic Details</Heading>
      <History id={id} type={type} limit={limit} />
      <Heading variant="h3">Meta</Heading>
      <MetaHistory id={id} type={metaType} limit={limit} />
    </>
  )
}
