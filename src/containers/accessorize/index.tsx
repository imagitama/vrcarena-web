import React from 'react'
import { Helmet } from 'react-helmet'
import { useParams } from 'react-router-dom'
import useDataStoreItem from '../../hooks/useDataStoreItem'

import Wardrobe from '../../components/wardrobe'
import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import { FullAsset, ViewNames } from '../../modules/assets'

const View = () => {
  const { assetId } = useParams<{ assetId: string }>()
  const [isLoading, lastErrorCode, baseAsset] = useDataStoreItem<FullAsset>(
    ViewNames.GetFullAssets,
    assetId,
    'accessorize'
  )

  if (isLoading || !baseAsset) {
    return <LoadingIndicator message="Loading asset..." />
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>Failed to load asset (code {lastErrorCode})</ErrorMessage>
    )
  }

  return (
    <>
      <Helmet>
        <title>
          View accessories for the asset {baseAsset.title || '(no title)'} |
          VRCArena
        </title>
        <meta
          name="description"
          content="Browse and select accessories for the asset and export it for other people to see."
        />
      </Helmet>
      <Wardrobe assetId={assetId} baseAsset={baseAsset} />
    </>
  )
}

export default () => (
  <>
    <Helmet>
      <title>View accessories for an asset | VRCArena</title>
      <meta
        name="description"
        content="Browse and select accessories for the asset and export it for other people to see."
      />
    </Helmet>
    <View />
  </>
)
