import React from 'react'
import { useParams } from 'react-router-dom'

import AssetOverview from '@/components/asset-overview'

export default () => {
  const { assetId, tabName } = useParams<{
    assetId: string
    tabName?: string
  }>()
  return <AssetOverview assetId={assetId} tabName={tabName} />
}
