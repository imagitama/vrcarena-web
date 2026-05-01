import React, { useContext } from 'react'

import AssetResults from '@/components/asset-results'
import LinkedAccessories from '@/components/linked-accessories'

import TabContext from '../../context'

export default () => {
  const { assetId, isLoading } = useContext(TabContext)

  return (
    <>
      {isLoading ? (
        <AssetResults shimmer />
      ) : (
        <LinkedAccessories assetId={assetId} />
      )}
    </>
  )
}
