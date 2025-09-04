import React, { Suspense, useCallback, useState } from 'react'
import { Helmet } from 'react-helmet'
import PetsIcon from '@mui/icons-material/Pets'
import ShuffleIcon from '@mui/icons-material/Shuffle'

import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import Button from '../../components/button'

import { getCategoryMeta } from '../../category-meta'
import * as routes from '../../routes'
import { AssetCategory, PublicAsset } from '../../modules/assets'
import AssetsPaginatedView from '../../components/assets-paginated-view'
import { GetQuery } from '../../data-store'
import LoadingIndicator from '@/components/loading-indicator'

function getDisplayNameByCategoryName(categoryName: AssetCategory): string {
  return getCategoryMeta(categoryName).name
}

function getDescriptionByCategoryName(categoryName: AssetCategory): string {
  return getCategoryMeta(categoryName).shortDescription
}

const categoryName = AssetCategory.Avatar

const ViewAvatarsView = () => {
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
        {getDisplayNameByCategoryName(categoryName)}
      </Heading>
      <BodyText>{getDescriptionByCategoryName(categoryName)}</BodyText>
      <Suspense fallback={<LoadingIndicator message="VIEW AVATARS" />}>
        <AssetsPaginatedView
          getQuery={getQuery}
          name="view-avatars"
          categoryName={AssetCategory.Avatar}
          extraControls={[
            <Suspense
              fallback={<LoadingIndicator message="Loading assets..." />}>
              <Button
                url={routes.viewAllSpecies}
                icon={<PetsIcon />}
                color="secondary">
                Browse All Species
              </Button>
            </Suspense>,
            <Suspense
              fallback={<LoadingIndicator message="Loading assets..." />}>
              <Button
                url={routes.randomAvatars}
                icon={<ShuffleIcon />}
                color="secondary">
                Random
              </Button>
            </Suspense>,
          ]}
          urlWithPageNumberVar={routes.viewAvatarsWithPageVar}
          getQueryString={() => `category:${AssetCategory.Avatar}`}
        />
      </Suspense>
    </>
  )
}

export default ViewAvatarsView
