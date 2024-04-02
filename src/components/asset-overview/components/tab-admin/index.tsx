import React, { useContext } from 'react'

import Heading from '../../../heading'
import AdminHistory from '../../../admin-history'
import TabContext from '../../context'
import { CollectionNames } from '../../../../modules/assets'

export default () => {
  const { assetId } = useContext(TabContext)

  return (
    <>
      <Heading variant="h2">History</Heading>
      <AdminHistory
        id={assetId}
        limit={10}
        type={CollectionNames.Assets}
        metaType={CollectionNames.AssetsMeta}
      />
    </>
  )
}
