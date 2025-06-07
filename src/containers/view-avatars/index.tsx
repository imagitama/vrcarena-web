import React, { useCallback, useState } from 'react'
import { Helmet } from 'react-helmet'
import PetsIcon from '@material-ui/icons/Pets'
import ShuffleIcon from '@material-ui/icons/Shuffle'

import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import Button from '../../components/button'

import { getCategoryMeta } from '../../category-meta'
import * as routes from '../../routes'
import {
  Asset,
  AssetCategory,
  PublicAsset,
  ViewNames,
} from '../../modules/assets'
import AssetsPaginatedView from '../../components/assets-paginated-view'
import { GetQuery } from '../../data-store'

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

      <div>
        <Heading variant="h1">
          {getDisplayNameByCategoryName(categoryName)}
        </Heading>
        <BodyText>{getDescriptionByCategoryName(categoryName)}</BodyText>
        <AssetsPaginatedView
          getQuery={getQuery}
          sortKey="view-avatars"
          extraControls={[
            <Button
              url={routes.viewAllSpecies}
              icon={<PetsIcon />}
              color="default">
              Browse All Species
            </Button>,
            <Button
              url={routes.randomAvatars}
              icon={<ShuffleIcon />}
              color="default">
              Random
            </Button>,
          ]}
          urlWithPageNumberVar={routes.viewAvatarsWithPageVar}
          getQueryString={() => `category:${AssetCategory.Avatar}`}
        />
      </div>
    </>
  )
}

export default ViewAvatarsView
