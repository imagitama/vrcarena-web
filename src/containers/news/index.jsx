import React, { useCallback } from 'react'
import { Helmet } from 'react-helmet'

import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import PaginatedView from '../../components/paginated-view'
import SimpleResultsItem from '../../components/simple-results-item'

import categoryMeta from '../../category-meta'
import { AssetCategories, AssetFieldNames } from '../../hooks/useDatabaseQuery'
import useIsAdultContentEnabled from '../../hooks/useIsAdultContentEnabled'
import * as routes from '../../routes'
import { trimDescription } from '../../utils/formatting'

function getDisplayNameByCategoryName(categoryName) {
  return categoryMeta[categoryName].name
}

function getDescriptionByCategoryName(categoryName) {
  return categoryMeta[categoryName].shortDescription
}

const Renderer = ({ items }) => (
  <div>
    {items.map(
      ({
        id,
        [AssetFieldNames.title]: title,
        [AssetFieldNames.description]: description,
        [AssetFieldNames.createdAt]: createdAt,
        [AssetFieldNames.createdBy]: createdBy,
        [AssetFieldNames.thumbnailUrl]: thumbnailUrl,
        [AssetFieldNames.slug]: slug
      }) => (
        <SimpleResultsItem
          key={id}
          url={routes.viewAssetWithVar.replace(':assetId', slug || id)}
          title={title}
          description={trimDescription(description)}
          date={createdAt}
          thumbnailUrl={thumbnailUrl}
        />
      )
    )}
  </div>
)

export default () => {
  const categoryName = AssetCategories.article
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
          {getDisplayNameByCategoryName(categoryName)}
        </Heading>
        <BodyText>{getDescriptionByCategoryName(categoryName)}</BodyText>
        <PaginatedView
          viewName="getPublicAssets"
          getQuery={getQuery}
          sortKey="news"
          defaultFieldName={AssetFieldNames.createdAt}
          urlWithPageNumberVar={routes.viewCategoryWithPageNumberVar.replace(
            ':categoryName',
            categoryName
          )}>
          <Renderer />
        </PaginatedView>
      </div>
    </>
  )
}
