import React, { useCallback } from 'react'
import { makeStyles } from '@mui/styles'
import CheckroomIcon from '@mui/icons-material/Checkroom'

import useDataStore from '../../hooks/useDataStore'
import useIsAdultContentEnabled from '../../hooks/useIsAdultContentEnabled'
import { AssetCategory, PublicAsset, ViewNames } from '../../modules/assets'
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

const LinkedAccessories = ({
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
        .select<any, PublicAsset>('*', {
          count: 'estimated',
        })
        .eq('category', AssetCategory.Accessory)
        // TODO: Since changing children => relations we need to create a SQL functions to lookup relation
        // @ts-ignore
        .contains('children', [assetId])
        .limit(limit)
        // @ts-ignore
        .order('random')

      query =
        isAdultContentEnabled === false ? query.is('isadult', false) : query

      return query
    },
    [assetId, isAdultContentEnabled]
  )
  const [isLoading, lastErrorCode, results, totalCount] =
    useDataStore<PublicAsset>(getQuery, 'linked-accessories')
  const classes = useStyles()

  if (isLoading || !results) {
    return (
      <>
        <AssetResults shimmer />
      </>
    )
  }

  if (lastErrorCode !== null) {
    return <ErrorMessage>Failed to load accessories</ErrorMessage>
  }

  if (!results.length) {
    return <NoResultsMessage>No accessories found</NoResultsMessage>
  }

  return (
    <div className={classes.root}>
      <AssetResults assets={results} />
      {totalCount && totalCount > results.length ? (
        <FindMoreAssetsButton
          icon={<CheckroomIcon />}
          url={routes.accessorizeWithVar.replace(':assetId', assetId)}
          label="Browse Accessories"
        />
      ) : null}
    </div>
  )
}

export default LinkedAccessories
