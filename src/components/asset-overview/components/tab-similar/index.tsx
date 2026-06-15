import React, { useContext } from 'react'

import { PublicAsset } from '@/modules/assets'
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

  const {
    similarassets: nonAiSims,
    aisimilarities: aiSims,
    aisimilaritiesdata: aiSimsData,
  } = asset

  const sims: PublicAsset[] = aiSimsData !== null ? aiSimsData : nonAiSims

  const similarAssets = isAdultContentEnabled
    ? sims
    : sims.filter((similarAsset) => similarAsset.isadult !== true)

  if (!similarAssets.length) {
    return <NoResultsMessage>No similar assets found</NoResultsMessage>
  }

  return <AssetResults assets={similarAssets} />
}
