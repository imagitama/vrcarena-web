import React, { useCallback, useState } from 'react'
import { Helmet } from 'react-helmet'
import { useLocation, useParams } from 'react-router'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import CheckBoxIcon from '@material-ui/icons/CheckBox'

import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import PaginatedView from '../../components/paginated-view'
import AssetResults from '../../components/asset-results'
import Button from '../../components/button'

import categoryMeta from '../../category-meta'
import { AssetCategories, AssetFieldNames } from '../../hooks/useDatabaseQuery'
import useIsAdultContentEnabled from '../../hooks/useIsAdultContentEnabled'
import * as routes from '../../routes'

import AvatarTutorialSection from './components/avatar-tutorial-section'
import AssetsByArea from '../../components/assets-by-area'
import AreaNavigation from '../../components/area-navigation'
import Link from '../../components/link'

function getDisplayNameByCategoryName(categoryName) {
  const category = categoryMeta[categoryName]
  if (!category) {
    return 'Unknown Category'
  }
  return category.name
}

function getDescriptionByCategoryName(categoryName) {
  const category = categoryMeta[categoryName]
  if (!category) {
    return 'This category has been removed or is unavailable.'
  }
  return category.shortDescription
}

const Renderer = ({ items, categoryName, groupByAreaEnabled }) => {
  if (groupByAreaEnabled) {
    return <AssetsByArea assets={items} categoryName={categoryName} />
  } else {
    return <AssetResults assets={items} showAddToCart />
  }
}

export default () => {
  const { categoryName } = useParams()
  const { pathname } = useLocation()
  const isAdultContentEnabled = useIsAdultContentEnabled()
  const getQuery = useCallback(
    query => {
      query = query.eq(AssetFieldNames.category, categoryName)
      if (!isAdultContentEnabled) {
        query = query.eq(AssetFieldNames.isAdult, false)
      }
      return query
    },
    [categoryName, isAdultContentEnabled]
  )
  const [groupByAreaEnabled, setGroupByAreaEnabled] = useState(true)

  const toggleGroupByArea = () =>
    setGroupByAreaEnabled(currentVal => !currentVal)

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

      <div>
        <Heading variant="h1">
          <Link to={pathname}>
            {getDisplayNameByCategoryName(categoryName)}
          </Link>
        </Heading>
        <BodyText>{getDescriptionByCategoryName(categoryName)}</BodyText>
        {categoryName === AssetCategories.tutorial && <AvatarTutorialSection />}
        <AreaNavigation categoryName={categoryName} />
        <PaginatedView
          viewName="getPublicAssets"
          getQuery={getQuery}
          sortKey="view-category"
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
            </Button>
          ]}>
          <Renderer
            categoryName={categoryName}
            groupByAreaEnabled={groupByAreaEnabled}
          />
        </PaginatedView>
      </div>
    </>
  )
}
