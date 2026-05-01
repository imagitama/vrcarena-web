import React, { useCallback } from 'react'

import { PublicAsset, ViewNames } from '@/modules/assets'

import { GetQueryFn } from '@/components/paginated-view'
import AssetResults from '@/components/asset-results'
import WarningMessage from '@/components/warning-message'
import AssetsPaginatedView from '@/components/assets-paginated-view'

import useUserOverview from '../../useUserOverview'

const Renderer = ({ items }: { items?: PublicAsset[] }) => (
  <AssetResults assets={items} />
)

const TabAssets = () => {
  const { userId, user } = useUserOverview()
  const getQuery = useCallback<GetQueryFn<PublicAsset>>(
    (query) => query.eq('createdby', userId),
    [userId]
  )

  if (!userId || !user) {
    return null
  }

  return (
    <>
      <WarningMessage>
        These are assets this user has posted to the site and are not
        necessarily what they have created. Users are separate to authors.
      </WarningMessage>
      <AssetsPaginatedView
        viewName={ViewNames.GetPublicAssets}
        getQuery={getQuery}
        name="view-user-assets">
        <Renderer />
      </AssetsPaginatedView>
    </>
  )
}

export default TabAssets
