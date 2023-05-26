import React, { useCallback } from 'react'
import { Helmet } from 'react-helmet'
import { useLocation, useParams } from 'react-router'

import PaginatedView from '../../components/paginated-view'
import AssetResults from '../../components/asset-results'
import TagChips from '../../components/tag-chips'
import AreaNavigation from '../../components/area-navigation'
import Heading from '../../components/heading'

import categoryMeta from '../../category-meta'
import { AssetFieldNames } from '../../hooks/useDatabaseQuery'
import useIsAdultContentEnabled from '../../hooks/useIsAdultContentEnabled'
import * as routes from '../../routes'
import { areasByCategory } from '../../areas'
import { Link } from 'react-router-dom'

function getDisplayNameByCategoryName(categoryName) {
  return categoryMeta[categoryName].name
}

function getDisplayName(categoryName, areaName) {
  return areasByCategory[categoryName][areaName].namePlural
}

function getTags(categoryName, areaName) {
  return areasByCategory[categoryName][areaName].tags
}

const Renderer = ({ items }) => <AssetResults assets={items} />

export default () => {
  const { categoryName, areaName } = useParams()
  const isAdultContentEnabled = useIsAdultContentEnabled()
  const getQuery = useCallback(
    query => {
      query = query
        .eq(AssetFieldNames.category, categoryName)
        .overlaps(AssetFieldNames.tags, getTags(categoryName, areaName))
      if (!isAdultContentEnabled) {
        query = query.eq(AssetFieldNames.isAdult, false)
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
        <PaginatedView
          viewName="getPublicAssets"
          getQuery={getQuery}
          sortKey="view-area"
          sortOptions={[
            {
              label: 'Submission date',
              fieldName: AssetFieldNames.createdAt
            },
            {
              label: 'Title',
              fieldName: AssetFieldNames.title
            }
          ]}
          defaultFieldName={AssetFieldNames.createdAt}
          urlWithPageNumberVar={routes.viewAreaWithPageNumberVar
            .replace(':categoryName', categoryName)
            .replace(':areaName', areaName)}>
          <Renderer />
        </PaginatedView>
      </div>
    </>
  )
}
