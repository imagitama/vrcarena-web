import React, { useCallback, useState } from 'react'
import { Helmet } from 'react-helmet'
import PetsIcon from '@material-ui/icons/Pets'
import ShuffleIcon from '@material-ui/icons/Shuffle'

import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import PaginatedView from '../../components/paginated-view'
import AssetResults from '../../components/asset-results'
import Button from '../../components/button'

import {
  AssetCategories,
  AssetFieldNames,
  OrderDirections
} from '../../hooks/useDatabaseQuery'
import useIsAdultContentEnabled from '../../hooks/useIsAdultContentEnabled'

import categoryMeta from '../../category-meta'
import * as routes from '../../routes'
import { Asset } from '../../modules/assets'

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

const sortKey = 'view-avatars'
const defaultFieldName = 'createdat'
const endorsementCountFieldName = 'endorsementcount'

export default () => {
  const categoryName = AssetCategories.avatar
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
          viewName={'getPublicAssets'}
          // @ts-ignore
          getQuery={getQuery}
          sortKey={sortKey}
          sortOptions={[
            {
              label: 'Created date',
              fieldName: AssetFieldNames.createdAt
            },
            {
              label: 'Title',
              fieldName: AssetFieldNames.title
            },
            {
              label: 'Endorsements',
              fieldName: endorsementCountFieldName
            }
          ]}
          // @ts-ignore
          defaultFieldName={defaultFieldName}
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
            </Button>
          ]}
          urlWithPageNumberVar={routes.viewAvatarsWithPageVar}
          getQueryString={() => `category:${AssetCategories.avatar}`}>
          <Renderer />
        </PaginatedView>
      </div>
    </>
  )
}
