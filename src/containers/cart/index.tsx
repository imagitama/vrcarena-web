import React from 'react'
import { Helmet } from 'react-helmet'
import useCart from '../../hooks/useCart'
import { PublicAsset, ViewNames } from '../../modules/assets'
import useDataStoreItems from '../../hooks/useDataStoreItems'
import LoadingIndicator from '../../components/loading-indicator'
import AssetResults from '../../components/asset-results'
import ErrorMessage from '../../components/error-message'
import NoResultsMessage from '../../components/no-results-message'

export default () => {
  const { ids, remove } = useCart()
  const isCartEmpty = ids.length === 0
  const [isLoading, lastErrorCode, assets] = useDataStoreItems<PublicAsset>(
    ViewNames.GetPublicAssets,
    !isCartEmpty ? ids : false
  )

  return (
    <>
      <Helmet>
        <title>Upload a new asset to the site | VRCArena</title>
        <meta
          name="description"
          content="Complete the form, submit it for approval and your asset will be visible on the site."
        />
      </Helmet>
      {lastErrorCode !== null ? (
        <ErrorMessage>Failed to load cart</ErrorMessage>
      ) : isCartEmpty ? (
        <NoResultsMessage>Cart empty</NoResultsMessage>
      ) : isLoading ? (
        <LoadingIndicator message="Loading cart..." />
      ) : assets ? (
        <AssetResults assets={assets} />
      ) : null}
    </>
  )
}
