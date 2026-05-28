import React from 'react'
import { Helmet } from '@unhead/react/helmet'

import * as routes from '@/routes'
import { PublicAsset, ViewNames } from '@/modules/assets'

import Heading from '@/components/heading'
import AssetResults from '@/components/asset-results'
import AssetsPaginatedView from '@/components/assets-paginated-view'

const Renderer = ({ items }: { items?: PublicAsset[] }) => {
  return <AssetResults assets={items} />
}

const NewAssetsView = () => {
  return (
    <>
      <Helmet>
        <title>Browse the newly approved assets posted on the site</title>
        <meta
          name="description"
          content="Here is a list of assets that have been posted on the site and recently approved."
        />
      </Helmet>
      <div>
        <Heading variant="h1">New Assets</Heading>
        <p>
          Assets that have been approved (not just created) in the past 7 days.
        </p>
        <AssetsPaginatedView
          viewName={ViewNames.GetNewPublicAssets}
          urlWithPageNumberVar={routes.newAssetsWithPageNumberVar}>
          <Renderer />
        </AssetsPaginatedView>
      </div>
    </>
  )
}

export default NewAssetsView
