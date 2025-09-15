import React, { useContext } from 'react'
import AssetResults from '../../../asset-results'
import TabContext from '../../context'
import NoResultsMessage from '../../../no-results-message'

export default () => {
  const { asset } = useContext(TabContext)

  if (!asset) {
    return null
  }

  const { similarassets } = asset

  if (!similarassets.length) {
    return <NoResultsMessage>No similar assets found</NoResultsMessage>
  }

  return <AssetResults assets={similarassets} />
}
