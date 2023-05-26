import React, { useContext } from 'react'
import AssetResults from '../../../asset-results'
import TabContext from '../../context'
import LinkedAccessories from '../../../linked-accessories'

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
