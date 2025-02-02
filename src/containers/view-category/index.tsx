import React, { useCallback, useState } from 'react'
import { Helmet } from 'react-helmet'
import { useLocation, useParams } from 'react-router'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import { PostgrestFilterBuilder } from '@supabase/postgrest-js'

import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import PaginatedView from '../../components/paginated-view'
import AssetResults from '../../components/asset-results'
import Button from '../../components/button'

import { getCategoryMeta } from '../../category-meta'
import useIsAdultContentEnabled from '../../hooks/useIsAdultContentEnabled'
import * as routes from '../../routes'

import AvatarTutorialSection from './components/avatar-tutorial-section'
import AssetsByArea from '../../components/assets-by-area'
import AreaNavigation from '../../components/area-navigation'
import Link from '../../components/link'
import { AssetCategory, PublicAsset, ViewNames } from '../../modules/assets'
import { GetQuery } from '../../data-store'

function getDisplayNameByCategoryName(categoryName: AssetCategory): string {
  const category = getCategoryMeta(categoryName)
  return category.name
}

function getDescriptionByCategoryName(categoryName: AssetCategory): string {
  const category = getCategoryMeta(categoryName)
  return category.shortDescription
}

const Renderer = ({
  items,
  categoryName,
  groupByAreaEnabled,
}: {
  items?: PublicAsset[]
  categoryName: string
  groupByAreaEnabled?: boolean
}) => {
  if (groupByAreaEnabled) {
    return <AssetsByArea assets={items} categoryName={categoryName} />
  } else {
    return <AssetResults assets={items} />
  }
}

const ViewCategoryView = () => {
  const { categoryName } = useParams<{ categoryName: AssetCategory }>()
  const { pathname } = useLocation()
  const isAdultContentEnabled = useIsAdultContentEnabled()
  const getQuery = useCallback(
    (query: GetQuery<PublicAsset>): GetQuery<PublicAsset> => {
      query = query.eq('category', categoryName)
      if (!isAdultContentEnabled) {
        query = query.eq('isadult', false)
      }
      return query
    },
    [categoryName, isAdultContentEnabled]
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
      {categoryName === AssetCategory.Tutorial && <AvatarTutorialSection />}
      <AreaNavigation categoryName={categoryName} />
      <PaginatedView<PublicAsset>
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
        getQueryString={() => `category:${categoryName}`}>
        <Renderer
          categoryName={categoryName}
          groupByAreaEnabled={groupByAreaEnabled}
        />
      </PaginatedView>
    </>
  )
}

export default ViewCategoryView
