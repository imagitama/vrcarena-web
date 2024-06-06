import React, { useCallback } from 'react'
import { Helmet } from 'react-helmet'

import Heading from '../../components/heading'
import PaginatedView from '../../components/paginated-view'
import AssetResults from '../../components/asset-results'

import {
  AssetFieldNames,
  AssetMetaFieldNames,
} from '../../hooks/useDatabaseQuery'
import useIsAdultContentEnabled from '../../hooks/useIsAdultContentEnabled'
import * as routes from '../../routes'
import { PublicAsset, ViewNames } from '../../modules/assets'
import AssetsPaginatedView from '../../components/assets-paginated-view'

const Renderer = ({ items }: { items?: PublicAsset[] }) => {
  return <AssetResults assets={items} />
}

const NewAssetsView = () => {
  return (
    <>
      <Helmet>
        <title>
          Browse the newly approved assets posted on the site | VRCArena
        </title>
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
