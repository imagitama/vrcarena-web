import React from 'react'
import { Helmet } from 'react-helmet'
import { useParams } from 'react-router'

import AssetEditor from '@/components/asset-editor'

export default () => {
  const { assetId } = useParams<{ assetId: string }>()

  return (
    <>
      <Helmet>
        <title>Edit asset | VRCArena</title>
        <meta
          name="description"
          content="Edit all of the fields of an asset."
        />
      </Helmet>
      <AssetEditor assetId={assetId} />
    </>
  )
}
