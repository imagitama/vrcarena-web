import React, { useCallback } from 'react'
import { Helmet } from 'react-helmet'
import { useLocation, useParams } from 'react-router'

import PaginatedView, { GetQueryFn } from '../../components/paginated-view'
import AssetResults from '../../components/asset-results'
import TagChips from '../../components/tag-chips'
import AreaNavigation from '../../components/area-navigation'
import Heading from '../../components/heading'

import { getCategoryMeta } from '../../category-meta'
import useIsAdultContentEnabled from '../../hooks/useIsAdultContentEnabled'
import * as routes from '../../routes'
import { areasByCategory } from '../../areas'
import { Link } from 'react-router-dom'
import { AssetCategory, PublicAsset, ViewNames } from '../../modules/assets'

function getDisplayNameByCategoryName(categoryName: AssetCategory): string {
  return getCategoryMeta(categoryName).name
}

function getDisplayName(categoryName: AssetCategory, areaName: string): string {
  return areasByCategory[categoryName][areaName].namePlural
}

function getTags(categoryName: AssetCategory, areaName: string): string[] {
  return areasByCategory[categoryName][areaName].tags
}

const Renderer = ({ items }: { items?: PublicAsset[] }) => (
  <AssetResults assets={items} />
)

const ViewAreaView = () => {
  const { categoryName, areaName } = useParams<{
    categoryName: AssetCategory
    areaName: string
  }>()
  const isAdultContentEnabled = useIsAdultContentEnabled()
  const getQuery = useCallback<GetQueryFn<PublicAsset>>(
    (query) => {
      query = query
        .eq('category', categoryName)
        .overlaps('tags', getTags(categoryName, areaName))
      if (!isAdultContentEnabled) {
        query = query.eq('isadult', false)
      }
      return query
    },
    [areaName, isAdultContentEnabled, categoryName]
  )
  const { pathname } = useLocation()

  return (
    <>
      <Helmet>
        <title>
          {getDisplayName(categoryName, areaName)} | Browse accessories that are
          in this area | VRCArena
        </title>
        <meta
          name="description"
          content={`View all accessories for the area ${getDisplayName(
            categoryName,
            areaName
          )}.`}
        />
      </Helmet>
      <div>
        <Heading variant="h1">
          <Link to={pathname}>
            {getDisplayNameByCategoryName(categoryName)}
          </Link>
        </Heading>
        <AreaNavigation
          categoryName={categoryName}
          selectedAreaName={areaName}
        />
        <TagChips tags={getTags(categoryName, areaName)} />
        <PaginatedView<PublicAsset>
          viewName={ViewNames.GetPublicAssets}
          getQuery={getQuery}
          sortKey="view-area"
          sortOptions={[
            {
              label: 'Submission date',
              fieldName: 'createdat',
            },
            {
              label: 'Title',
              fieldName: 'title',
            },
          ]}
          defaultFieldName="createdat"
          urlWithPageNumberVar={routes.viewAreaWithPageNumberVar
            .replace(':categoryName', categoryName)
            .replace(':areaName', areaName)}>
          <Renderer />
        </PaginatedView>
      </div>
    </>
  )
}

export default ViewAreaView
