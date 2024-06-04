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

import categoryMeta from '../../category-meta'
import * as routes from '../../routes'
import {
  Asset,
  AssetCategory,
  PublicAsset,
  ViewNames,
} from '../../modules/assets'

function getDisplayNameByCategoryName(categoryName: string): string {
  return categoryMeta[categoryName].name
}

function getDescriptionByCategoryName(categoryName: string): string {
  return categoryMeta[categoryName].shortDescription
}

interface AssetWithSpeciesData extends Asset {
  speciesid: string // species to group by
  pluralname: string
  avatarcount: number
}

function Avatars({ avatars }: { avatars: AssetWithSpeciesData[] }) {
  return <AssetResults assets={avatars} showAddToCart />
}

const Renderer = ({ items }: { items?: AssetWithSpeciesData[] }) => {
  return (
    <>
      <Avatars avatars={items || []} />
    </>
  )
}

const categoryName = AssetCategory.Avatar

const ViewAvatarsView = () => {
  const isAdultContentEnabled = useIsAdultContentEnabled()

  const getQuery = useCallback(
    (query) => {
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
        <PaginatedView<PublicAsset>
          viewName={ViewNames.GetPublicAssets}
          getQuery={getQuery}
          sortKey="view-avatars"
          sortOptions={[
            {
              label: 'Created date',
              fieldName: 'createdat',
            },
            {
              label: 'Title',
              fieldName: 'title',
            },
            {
              label: 'Endorsements',
              fieldName: 'endorsementcount',
            },
          ]}
          defaultFieldName="createdat"
          defaultDirection={OrderDirections.DESC}
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
          getQueryString={() => `category:${AssetCategory.Avatar}`}>
          <Renderer />
        </PaginatedView>
      </div>
    </>
  )
}

export default ViewAvatarsView
