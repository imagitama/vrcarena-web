import React, { useCallback, useState } from 'react'
import { Helmet } from 'react-helmet'
import PetsIcon from '@material-ui/icons/Pets'
import ShuffleIcon from '@material-ui/icons/Shuffle'

import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import PaginatedView from '../../components/paginated-view'
import AssetResults from '../../components/asset-results'
import Button from '../../components/button'

import { AssetFieldNames, OrderDirections } from '../../hooks/useDatabaseQuery'
import useIsAdultContentEnabled from '../../hooks/useIsAdultContentEnabled'

import { getCategoryMeta } from '../../category-meta'
import * as routes from '../../routes'
import {
  Asset,
  AssetCategory,
  PublicAsset,
  ViewNames,
} from '../../modules/assets'
import AssetsPaginatedView from '../../components/assets-paginated-view'

function getDisplayNameByCategoryName(categoryName: AssetCategory): string {
  return getCategoryMeta(categoryName).name
}

function getDescriptionByCategoryName(categoryName: AssetCategory): string {
  return getCategoryMeta(categoryName).shortDescription
}

interface AssetWithSpeciesData extends Asset {
  speciesid: string // species to group by
  pluralname: string
  avatarcount: number
}

const categoryName = AssetCategory.Avatar

const ViewAvatarsView = () => {
  const getQuery = useCallback(
    (query) => {
      query = query.eq(AssetFieldNames.category, categoryName)
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
