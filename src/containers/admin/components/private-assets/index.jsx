import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'

import useDatabaseQuery, {
  CollectionNames,
  Operators,
  AssetMetaFieldNames,
  PublishStatuses
} from '../../../../hooks/useDatabaseQuery'

import Link from '../../../../components/link'
import LoadingIndicator from '../../../../components/loading-indicator'
import ErrorMessage from '../../../../components/error-message'
import NoResultsMessage from '../../../../components/no-results-message'

import * as routes from '../../../../routes'

const useStyles = makeStyles({
  table: {
    width: '100%'
  }
})

function AssetsTable({ assets }) {
  const classes = useStyles()

  return (
    <Paper>
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell>Asset</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {assets.map(({ id, title }) => (
            <TableRow key={id}>
              <TableCell>
                <Link to={routes.viewAssetWithVar.replace(':assetId', id)}>
                  {title}
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  )
}

export default () => {
  let [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.AssetCache,
    [
      [
        AssetMetaFieldNames.publishStatus,
        Operators.EQUALS,
        PublishStatuses.Draft
      ]
    ],
    1000
  )

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to get assets</ErrorMessage>
  }

  if (!results.length) {
    return <NoResultsMessage />
  }

  return <AssetsTable assets={results} />
}
