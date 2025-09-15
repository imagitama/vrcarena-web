import React, { useContext } from 'react'
import AssetResults from '../../../asset-results'
import TabContext from '../../context'
import NoResultsMessage from '../../../no-results-message'
import useIsAdultContentEnabled from '@/hooks/useIsAdultContentEnabled'

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
