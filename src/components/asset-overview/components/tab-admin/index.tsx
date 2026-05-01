import React, { useContext } from 'react'

import Heading from '@/components/heading'
import AssetTimeline from '@/components/asset-timeline'
import TabContext from '../../context'

export default () => {
  const { assetId } = useContext(TabContext)

  return (
    <>
      <Heading variant="h2">History</Heading>
      <AssetTimeline assetId={assetId} />
    </>
  )
}
