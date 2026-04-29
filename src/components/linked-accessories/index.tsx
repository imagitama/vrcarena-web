import React, { useCallback } from 'react'
import { makeStyles } from '@mui/styles'

import useDataStore from '@/hooks/useDataStore'
import useIsAdultContentEnabled from '@/hooks/useIsAdultContentEnabled'
import { AssetCategory, PublicAsset, ViewNames } from '@/modules/assets'

import AssetResults from '@/components/asset-results'
import ErrorMessage from '@/components/error-message'
import NoResultsMessage from '@/components/no-results-message'
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
    </div>
  )
}

export default LinkedAccessories
