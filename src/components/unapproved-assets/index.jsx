import React from 'react'
import Link from '../../components/link'
import { makeStyles } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'

import { CollectionNames } from '../../hooks/useDatabaseQuery'
import useSupabaseView from '../../hooks/useSupabaseView'

import * as routes from '../../routes'
import { trackAction } from '../../analytics'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import NoResultsMessage from '../no-results-message'
import ApproveButton from '../approve-button'

const useStyles = makeStyles({
  table: {
    width: '100%'
  }
})

function AssetsTable({ assets, hydrate }) {
  const classes = useStyles()

  return (
    <Paper>
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell>Asset</TableCell>
            <TableCell>Controls</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {assets.map(({ id, title, slug }) => (
            <TableRow key={id}>
              <TableCell>
                <Link
                  to={routes.viewAssetWithVar.replace(':assetId', slug || id)}>
                  {title || '(untitled)'}
                </Link>
              </TableCell>
              <TableCell>
                <ApproveButton
                  id={id}
                  metaCollectionName={CollectionNames.AssetMeta}
                  onClick={({ newValue }) => {
                    hydrate()

                    trackAction(
                      'AdminAssets',
                      newValue === true ? 'Approved asset' : 'Unapproved asset'
                    )
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  )
}

export default () => {
  let [isLoading, isErrored, results, , hydrate] = useSupabaseView(
    'getAssetsWaitingForApproval'
  )

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to get unapproved assets</ErrorMessage>
  }

  if (!results.length) {
    return <NoResultsMessage />
  }

  return <AssetsTable assets={results} hydrate={hydrate} />
}
