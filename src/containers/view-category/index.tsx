import React, { useCallback, useState } from 'react'
import { Helmet } from 'react-helmet'
import { useLocation, useParams } from 'react-router'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'

import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import Button from '../../components/button'

import { getCategoryMeta } from '../../category-meta'
import * as routes from '../../routes'

import AreaNavigation from '../../components/area-navigation'
import Link from '../../components/link'
import { AssetCategory, PublicAsset, ViewNames } from '../../modules/assets'
import AssetsPaginatedView from '../../components/assets-paginated-view'
import { GetQuery } from '../../data-store'
import ErrorBoundary from '../../components/error-boundary'

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
  const [groupByAreaEnabled, setGroupByAreaEnabled] = useState(true)

  const toggleGroupByArea = () =>
    setGroupByAreaEnabled((currentVal) => !currentVal)

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
        viewName={ViewNames.GetPublicAssets}
        getQuery={getQuery}
        sortKey="view-category"
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
        extraControls={[
          <Button
            onClick={() => toggleGroupByArea()}
            icon={
              groupByAreaEnabled ? (
                <CheckBoxIcon />
              ) : (
                <CheckBoxOutlineBlankIcon />
              )
            }>
            Group By Area
          </Button>,
        ]}
        getQueryString={() => `category:${categoryName}`}
        categoryName={categoryName}
        groupByAreaEnabled={groupByAreaEnabled}
      />
    </>
  )
}

export default ViewCategoryView
