import React, { useCallback } from 'react'
import { Helmet } from 'react-helmet'
import { useParams } from 'react-router'
import Link from '../../components/link'

import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import PaginatedView from '../../components/paginated-view'
import AssetResults from '../../components/asset-results'
import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'

import categoryMeta from '../../category-meta'
import {
  AssetCategories,
  AssetFieldNames,
  CollectionNames
} from '../../hooks/useDatabaseQuery'
import useIsAdultContentEnabled from '../../hooks/useIsAdultContentEnabled'
import useDataStoreItem from '../../hooks/useDataStoreItem'

import * as routes from '../../routes'
import { PublicAsset } from '../../modules/assets'
import { Species } from '../../modules/species'
import { symbols } from '../query'

function getDisplayNameByCategoryName(categoryName: string): string {
  return categoryMeta[categoryName].name
}

function getDescriptionByCategoryName(categoryName: string): string {
  return categoryMeta[categoryName].shortDescription
}

const Renderer = ({ items }: { items?: PublicAsset[] }) => (
  <AssetResults assets={items} />
)

const View = () => {
  const {
    speciesIdOrSlug: speciesId,
    categoryName = AssetCategories.avatar
  } = useParams<{ speciesIdOrSlug: string; categoryName: string }>()
  const isAdultContentEnabled = useIsAdultContentEnabled()
  const getQuery = useCallback(
    query => {
      query = query.contains(AssetFieldNames.species, [speciesId])
      query = query.eq(AssetFieldNames.category, categoryName)
      if (!isAdultContentEnabled) {
        query = query.eq(AssetFieldNames.isAdult, false)
      }
      return query
    },
    [speciesId, categoryName, isAdultContentEnabled]
  )

  const [isLoadingSpecies, isErrorLoadingSpecies, species] = useDataStoreItem<
    Species
  >(CollectionNames.Species, speciesId, 'view-species-category')

  if (isLoadingSpecies || !species) {
    return <LoadingIndicator message="Loading species..." />
  }

  if (isErrorLoadingSpecies) {
    return <ErrorMessage>Failed to load species</ErrorMessage>
  }

  return (
    <>
      <Helmet>
        <title>
          {species.pluralname} | {getDisplayNameByCategoryName(categoryName)} |{' '}
          {getDescriptionByCategoryName(categoryName)} | VRCArena
        </title>
        <meta
          name="description"
          content={getDescriptionByCategoryName(categoryName)}
        />
      </Helmet>

      <div>
        <Heading variant="h1">
          <Link
            to={routes.viewSpeciesWithVar.replace(
              ':speciesIdOrSlug',
              speciesId
            )}>
            {species.pluralname}
          </Link>
        </Heading>
        <Heading variant="h2">
          <Link
            to={routes.viewSpeciesCategoryWithVar
              .replace(':speciesIdOrSlug', speciesId)
              .replace(':categoryName', categoryName)}>
            {' '}
            {getDisplayNameByCategoryName(categoryName)}
          </Link>
        </Heading>
        <BodyText>{getDescriptionByCategoryName(categoryName)}</BodyText>
        <PaginatedView
          viewName="getPublicAssets"
          // @ts-ignore
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
          urlWithPageNumberVar={routes.viewSpeciesCategoryWithVarAndPageNumberVar
            .replace(':speciesIdOrSlug', speciesId)
            .replace(':categoryName', categoryName)}
          getQueryString={() => `species:${species.id}`}>
          <Renderer />
        </PaginatedView>
      </div>
    </>
  )
}

export default () => (
  <>
    <Helmet>
      <title>View category for species | VRCArena</title>
      <meta
        name="description"
        content="Browse assets inside a category filtered by a species."
      />
    </Helmet>
    <View />
  </>
)
