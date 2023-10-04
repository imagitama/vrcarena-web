import React, { useCallback } from 'react'
import { Helmet } from 'react-helmet'
import Link from '../../components/link'
import { makeStyles } from '@material-ui/core/styles'
import EditIcon from '@material-ui/icons/Edit'
import LaunchIcon from '@material-ui/icons/Launch'
import { useParams } from 'react-router'

import Markdown from '../../components/markdown'
import Heading from '../../components/heading'
import ErrorMessage from '../../components/error-message'
import Button from '../../components/button'
import BodyText from '../../components/body-text'
import LoadingIndicator from '../../components/loading-indicator'

import {
  AssetCategories,
  AssetFieldNames,
  CollectionNames,
  SpeciesFieldNames
} from '../../hooks/useDatabaseQuery'
import useUserRecord from '../../hooks/useUserRecord'
import useDataStore from '../../hooks/useDataStore'

import {
  getDescriptionForHtmlMeta,
  getOpenGraphUrlForRouteUrl,
  canEditSpecies
} from '../../utils'
import * as routes from '../../routes'
import { trackAction } from '../../analytics'
import { fixAccessingImagesUsingToken } from '../../utils'
import { client as supabase } from '../../supabase'
import useIsAdultContentEnabled from '../../hooks/useIsAdultContentEnabled'
import { Species } from '../../modules/species'
import PaginatedView from '../../components/paginated-view'
import AssetResults from '../../components/asset-results'
import { Asset } from '../../modules/assets'

const useStyles = makeStyles({
  description: {
    '& *:first-child': {
      marginTop: 0
    },
    '& *:last-child': {
      marginBottom: 0
    }
  },
  thumbnailWrapper: {
    width: '200px',
    height: '200px',
    '& img': {
      width: '100%',
      height: '100%'
    }
  }
})

// const otherSpeciesSlug = 'other-species'

function isRouteVarAFirebaseId(routeVar: string): boolean {
  return routeVar &&
    routeVar.length >= 20 &&
    routeVar.match(/^[a-z0-9]+$/i) !== null &&
    !routeVar.includes(' ')
    ? true
    : false
}

const analyticsCategory = 'ViewSpecies'

const Renderer = ({ items }: { items: Asset[] }) => (
  <AssetResults assets={items} showAddToCart />
)

const SpeciesResult = ({ speciesIdOrSlug }: { speciesIdOrSlug: string }) => {
  const isFirebaseId = isRouteVarAFirebaseId(speciesIdOrSlug)
  const [, , user] = useUserRecord()
  const getSpeciesQuery = useCallback(
    () =>
      supabase
        .from(CollectionNames.Species)
        .select('*')
        .or(
          `id.eq.${speciesIdOrSlug},${
            SpeciesFieldNames.slug
          }.eq.${speciesIdOrSlug}`
        ),
    [speciesIdOrSlug]
  )
  let [isLoading, isError, species] = useDataStore<Species>(
    getSpeciesQuery,
    'view-species'
  )
  const classes = useStyles()
  const isAdultContentEnabled = useIsAdultContentEnabled()
  const getAvatarsQuery = useCallback(
    query => {
      if (!species) {
        return null
      }
      query = query.eq(AssetFieldNames.category, AssetCategories.avatar)
      query = query.contains(AssetFieldNames.species, [species.id])
      if (!isAdultContentEnabled) {
        query = query.eq(AssetFieldNames.isAdult, false)
      }
      return query
    },
    [species && species.id, isAdultContentEnabled]
  )

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isError) {
    return <ErrorMessage>Failed to load species</ErrorMessage>
  }

  if (!species || (!isFirebaseId && !species)) {
    return <ErrorMessage>Could not found that species</ErrorMessage>
  }

  const titleWithoutSuffix = `${species.pluralname} | ${
    species.shortdescription
  }`

  return (
    <>
      <Helmet>
        <title>{titleWithoutSuffix} | VRCArena</title>
        <meta name="description" content={species.shortdescription} />
        <meta property="og:title" content={titleWithoutSuffix} />
        <meta property="og:type" content="website" />
        <meta
          property="og:description"
          content={getDescriptionForHtmlMeta(species.shortdescription)}
        />
        <meta
          property="og:url"
          content={getOpenGraphUrlForRouteUrl(
            routes.viewSpeciesWithVar.replace(':speciesIdOrSlug', species.id)
          )}
        />
        <meta
          property="og:image"
          content={fixAccessingImagesUsingToken(species.thumbnailurl)}
        />
      </Helmet>
      <div className={classes.thumbnailWrapper}>
        <a
          href={species.thumbnailsourceurl}
          title={`Visit the source of the thumbnail for ${species.pluralname}`}
          target="_blank"
          rel="noopener noreferrer">
          <img
            src={fixAccessingImagesUsingToken(species.thumbnailurl)}
            alt={`Thumbnail for species ${species.pluralname}`}
          />
          View Thumbnail Source <LaunchIcon style={{ fontSize: '100%' }} />
        </a>
      </div>
      <Heading variant="h1">
        <Link
          to={routes.viewSpeciesWithVar.replace(
            ':speciesIdOrSlug',
            species.id
          )}>
          {species.pluralname}
        </Link>
      </Heading>
      <BodyText>
        <Markdown source={species.description} />
      </BodyText>
      {canEditSpecies(user) && (
        <>
          <Heading variant="h2">Actions</Heading>
          <Button
            url={routes.editSpeciesWithVar.replace(':speciesId', species.id)}
            icon={<EditIcon />}
            onClick={() =>
              trackAction(
                analyticsCategory,
                'Click edit species button',
                // @ts-ignore
                species.id
              )
            }>
            Edit
          </Button>
        </>
      )}
      <PaginatedView
        viewName="getPublicAssets"
        // @ts-ignore
        getQuery={getAvatarsQuery}
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
        urlWithPageNumberVar={routes.viewSpeciesCategoryWithVarAndPageNumberVar.replace(
          ':speciesIdOrSlug',
          speciesIdOrSlug
        )}>
        {/* @ts-ignore */}
        <Renderer />
      </PaginatedView>
    </>
  )
}

// const species = {
//   [SpeciesFieldNames.pluralName]: 'Other Species',
//   [SpeciesFieldNames.description]: 'Assets that do not have a species.',
//   [SpeciesFieldNames.shortDescription]: 'Assets that do not have a species.'
// }

// const titleWithoutSuffix = `${species[SpeciesFieldNames.pluralName]} | ${
//   species[SpeciesFieldNames.shortDescription]
// }`

export default () => {
  const { speciesIdOrSlug } = useParams<{ speciesIdOrSlug: string }>()

  return (
    <>
      <Helmet>
        <title>View species | VRCArena</title>
        <meta
          name="description"
          content="View the info and assets of a species on the site."
        />
      </Helmet>
      <SpeciesResult speciesIdOrSlug={speciesIdOrSlug} />
    </>
  )
}
