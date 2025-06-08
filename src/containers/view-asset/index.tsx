import React from 'react'
import { useParams } from 'react-router-dom'
import AssetOverview from '../../components/asset-overview'

export default () => {
  const { assetId } = useParams<{ assetId: string }>()
  return <AssetOverview assetId={assetId} />
}
