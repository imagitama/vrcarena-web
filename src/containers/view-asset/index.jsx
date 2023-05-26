import React from 'react'
import { useParams } from 'react-router-dom'
import AssetOverview from '../../components/asset-overview'

export default () => {
  const { assetId } = useParams()

  return <AssetOverview assetId={assetId} />
}
