import React, { useContext } from 'react'

import useDataStoreItem from '../../../../hooks/useDataStoreItem'

import AssetResults from '../../../asset-results'
import TabContext from '../../context'
import NoResultsMessage from '../../../no-results-message'
import LoadingIndicator from '../../../loading-indicator'
import ErrorMessage from '../../../error-message'
import { RelatedAssetsResult, ViewNames } from '../../../../modules/assets'

const RelatedAssets = ({ assetId }: { assetId: string }) => {
  const [isLoading, lastErrorCode, result] =
    useDataStoreItem<RelatedAssetsResult>(
      ViewNames.RelatedAssets,
      assetId,
      'tab-related'
    )

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>
        Failed to load related assets (code {lastErrorCode})
      </ErrorMessage>
    )
  }

  if (isLoading || result === null) {
    return <LoadingIndicator message="Finding related assets..." />
  }

  const assets = result && result.results ? result.results : []

  if (!assets.length) {
    return <NoResultsMessage>No related assets found</NoResultsMessage>
  }

  return <AssetResults assets={assets} />
}

export default () => {
  const { assetId } = useContext(TabContext)

  return (
    <div>
      <RelatedAssets assetId={assetId} />
    </div>
  )
}
