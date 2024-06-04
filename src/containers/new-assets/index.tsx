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
import { PublicAsset } from '../../modules/assets'

const Renderer = ({ items }: { items?: PublicAsset[] }) => {
  return <AssetResults assets={items} />
}

const hoursInPast = 24 * 7
const getDateOfStartPeriod = () =>
  new Date(new Date().getTime() - hoursInPast * 60 * 60 * 1000)

const NewAssetsView = () => {
  const isAdultContentEnabled = useIsAdultContentEnabled()
  const getQuery = useCallback(
    (query) => {
      query = query.gt(
        AssetMetaFieldNames.approvedAt,
        getDateOfStartPeriod().toISOString()
      )

      if (!isAdultContentEnabled) {
        query = query.eq(AssetFieldNames.isAdult, false)
      }
      return query
    },
    [isAdultContentEnabled]
  )

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
        <PaginatedView<PublicAsset>
          viewName="getPublicAssets"
          getQuery={getQuery}
          defaultFieldName="createdat"
          urlWithPageNumberVar={routes.newAssetsWithPageNumberVar}>
          <Renderer />
        </PaginatedView>
      </div>
    </>
  )
}

export default NewAssetsView
