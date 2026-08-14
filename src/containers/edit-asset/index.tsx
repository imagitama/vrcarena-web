import React from 'react'
import { Helmet } from '@unhead/react/helmet'
import { useParams } from 'react-router'

import AssetEditor from '@/components/asset-editor'
import { scrollToTop } from '@/utils'
import usePermissions from '@/hooks/usePermissions'
import { routes } from '@/routes'
import NoPermissionMessage from '@/components/no-permission-message'

export default () => {
  const { assetId } = useParams<{ assetId: string }>()

  if (!usePermissions(routes.editAssetWithVar)) {
    return <NoPermissionMessage />
  }

  return (
    <>
      <Helmet>
        <title>Edit asset</title>
        <meta
          name="description"
          content="Edit all of the fields of an asset."
        />
      </Helmet>
      <AssetEditor assetId={assetId} onAttemptSave={scrollToTop} />
    </>
  )
}
