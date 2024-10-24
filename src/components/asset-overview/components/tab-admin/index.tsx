import React, { useContext } from 'react'

import Heading from '../../../heading'
import AdminHistory from '../../../admin-history'
import TabContext from '../../context'
import { CollectionNames } from '../../../../modules/assets'
import AssetTimeline from '../../../asset-timeline'

export default () => {
  const { assetId } = useContext(TabContext)

  return (
    <>
      <Heading variant="h2">History</Heading>
      <AssetTimeline assetId={assetId} />
    </>
  )
}
