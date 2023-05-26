import React, { useContext } from 'react'

import Heading from '../../../heading'
import AdminHistory from '../../../admin-history'
// import AssetAmendments from '../../../asset-amendments'
import TweetsAdmin from '../../../tweets-admin'
import TabContext from '../../context'

export default () => {
  const { assetId } = useContext(TabContext)

  return (
    <>
      <Heading variant="h2">History</Heading>
      <AdminHistory id={assetId} limit={10} />

      {/* <Heading variant="h2">Amendments</Heading>
      <AssetAmendments assetId={assetId} /> */}

      <Heading variant="h2">Tweets</Heading>
      <TweetsAdmin assetId={assetId} />
    </>
  )
}
