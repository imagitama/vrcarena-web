import React, { useCallback } from 'react'
import { Helmet } from 'react-helmet'
import { useLocation, useParams } from 'react-router'

import Heading from '../../components/heading'
import BodyText from '../../components/body-text'

import { getCategoryMeta } from '../../category-meta'
import * as routes from '../../routes'

import AreaNavigation from '../../components/area-navigation'
import Link from '../../components/link'
import { AssetCategory, PublicAsset, ViewNames } from '../../modules/assets'
import AssetsPaginatedView from '../../components/assets-paginated-view'
import { GetQuery } from '../../data-store'

function getDisplayNameByCategoryName(categoryName: AssetCategory): string {
  const category = getCategoryMeta(categoryName)
  return category.name
}

function getDescriptionByCategoryName(categoryName: AssetCategory): string {
  const category = getCategoryMeta(categoryName)
  return category.shortDescription
}

const ViewCategoryView = () => {
  const { categoryName } = useParams<{ categoryName: AssetCategory }>()
  const { pathname } = useLocation()
  const getQuery = useCallback<
    (query: GetQuery<PublicAsset>) => GetQuery<PublicAsset>
  >(
    (query) => {
      query = query.eq('category', categoryName)
      return query
    },
    [categoryName]
  )

  return (
    <>
      <Helmet>
        <title>
          {getDisplayNameByCategoryName(categoryName)} |{' '}
          {getDescriptionByCategoryName(categoryName)} | VRCArena
        </title>
        <meta
          name="description"
          content={getDescriptionByCategoryName(categoryName)}
        />
      </Helmet>
      <Heading variant="h1">
        <Link to={pathname}>{getDisplayNameByCategoryName(categoryName)}</Link>
      </Heading>
      <BodyText>{getDescriptionByCategoryName(categoryName)}</BodyText>
      <AreaNavigation categoryName={categoryName} />
      <AssetsPaginatedView
        name="view-category"
        viewName={ViewNames.GetPublicAssets}
        getQuery={getQuery}
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
        urlWithPageNumberVar={routes.viewCategoryWithPageNumberVar.replace(
          ':categoryName',
          categoryName
        )}
        getQueryString={() => `category:${categoryName}`}
        categoryName={categoryName}
        defaultGroupByArea
      />
    </>
  )
}

export default ViewCategoryView
