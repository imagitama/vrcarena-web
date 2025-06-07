import React, { useCallback } from 'react'
import { makeStyles } from '@material-ui/core/styles'

import useDataStore from '../../hooks/useDataStore'
import useIsAdultContentEnabled from '../../hooks/useIsAdultContentEnabled'
import { Asset, ViewNames } from '../../modules/assets'
import * as routes from '../../routes'

import AssetResults from '../asset-results'
import ErrorMessage from '../error-message'
import NoResultsMessage from '../no-results-message'
import FindMoreAssetsButton from '../find-more-assets-button'
import { SupabaseClient } from '@supabase/supabase-js'

const useStyles = makeStyles({
  root: {
    display: 'flex',
  },
})

export default ({
  assetId,
  limit = 5,
}: {
  assetId: string
  limit?: number
}) => {
  const isAdultContentEnabled = useIsAdultContentEnabled()
  const getQuery = useCallback(
    (supabase: SupabaseClient) => {
      let query = supabase
        .from(ViewNames.GetPublicAssets)
        .select('*', {
          count: 'estimated',
        })
        .contains('children', [assetId])
        .limit(limit)

      query =
        isAdultContentEnabled === false ? query.is('isadult', false) : query

      return query
    },
    [assetId, isAdultContentEnabled]
  )
  const [isLoading, lastErrorCode, results, totalCount] = useDataStore<Asset>(
    getQuery,
    'linked-assets'
  )
  const classes = useStyles()

  if (isLoading || !results) {
    return (
      <>
        <AssetResults shimmer />
      </>
    )
  }

  if (lastErrorCode !== null) {
    return <ErrorMessage>Failed to load linked assets</ErrorMessage>
  }

  if (!results.length) {
    return <NoResultsMessage />
  }

  return (
    <div className={classes.root}>
      <AssetResults assets={results} />
      {totalCount && totalCount > results.length ? (
        <FindMoreAssetsButton
          url={routes.accessorizeWithVar.replace(':assetId', assetId)}
          label="Browse All Links"
        />
      ) : null}
    </div>
  )
}
