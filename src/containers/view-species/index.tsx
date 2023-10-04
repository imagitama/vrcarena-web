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
import PageControls from '../../components/page-controls'

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
  let [isLoading, isError, speciesResults] = useDataStore<Species[]>(
    getSpeciesQuery,
    'view-species-info'
  )
  const species = speciesResults ? speciesResults[0] : null
  const classes = useStyles()
  const isAdultContentEnabled = useIsAdultContentEnabled()
  const getAvatarsQuery = useCallback(() => {
    if (!species) {
      return
    }

    let query = supabase
      .from('getpublicassets')
      .select('*')
      .eq(AssetFieldNames.category, AssetCategories.avatar)
      .contains(AssetFieldNames.species, [species.id])
      .order(AssetFieldNames.createdAt, { ascending: false })
      .limit(20)

    if (!isAdultContentEnabled) {
      query = query.eq(AssetFieldNames.isAdult, false)
    }

    return query
  }, [species && species.id, isAdultContentEnabled])
  let [isLoadingAssets, isErrorLoadingAssets, assets] = useDataStore<Asset[]>(
    species ? getAvatarsQuery : null,
    'view-species-assets'
  )

  if (isLoading || isLoadingAssets) {
    return <LoadingIndicator />
  }

  if (isError || isErrorLoadingAssets) {
    return <ErrorMessage>Failed to load species</ErrorMessage>
  }

  if (!species || (!isFirebaseId && !species) || !assets) {
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
      <Heading variant="h2">
        <Link
          to={routes.viewSpeciesCategoryWithVar
            .replace(':speciesIdOrSlug', species.id)
            .replace(':categoryName', AssetCategories.avatar)}>
          Avatars
        </Link>
      </Heading>
      <AssetResults assets={assets} />
      <PageControls>
        <Button
          url={routes.viewSpeciesCategoryWithVar
            .replace(':speciesIdOrSlug', species.id)
            .replace(':categoryName', AssetCategories.avatar)}
          color="default"
          onClick={() =>
            trackAction(analyticsCategory, 'Click all avatars button')
          }>
          View All Avatars
        </Button>
      </PageControls>
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
