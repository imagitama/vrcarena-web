import React, { useContext } from 'react'

import useIsAdultContentEnabled from '@/hooks/useIsAdultContentEnabled'

import AssetResults from '@/components/asset-results'
import NoResultsMessage from '@/components/no-results-message'

import TabContext from '../../context'

export default () => {
  const { asset } = useContext(TabContext)
  const isAdultContentEnabled = useIsAdultContentEnabled()

  if (!asset) {
    return null
  }

  const { similarassets: rawSimilarAssets } = asset

  const similarAssets = isAdultContentEnabled
    ? rawSimilarAssets
    : rawSimilarAssets.filter((similarAsset) => similarAsset.isadult !== true)

  if (!similarAssets.length) {
    return <NoResultsMessage>No similar assets found</NoResultsMessage>
  }

  return <AssetResults assets={similarAssets} />
}
