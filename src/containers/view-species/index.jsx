import React, { useCallback } from 'react'
import { Helmet } from 'react-helmet'
import Link from '../../components/link'
import { makeStyles } from '@material-ui/core/styles'
import EditIcon from '@material-ui/icons/Edit'
import LaunchIcon from '@material-ui/icons/Launch'
import LazyLoad from 'react-lazyload'
import { useParams } from 'react-router'

import Markdown from '../../components/markdown'
import Heading from '../../components/heading'
import RecentAssets from '../../components/recent-assets'
import ErrorMessage from '../../components/error-message'
import Button from '../../components/button'
import BodyText from '../../components/body-text'
import LoadingIndicator from '../../components/loading-indicator'

import {
  AssetCategories,
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

const otherSpeciesSlug = 'other-species'

function isRouteVarAFirebaseId(routeVar) {
  return (
    routeVar &&
    routeVar.length >= 20 &&
    routeVar.match(/^[a-z0-9]+$/i) !== null &&
    !routeVar.includes(' ')
  )
}

const analyticsCategory = 'ViewSpecies'

const SpeciesResult = ({ speciesIdOrSlug }) => {
  const isFirebaseId = isRouteVarAFirebaseId(speciesIdOrSlug)
  const [, , user] = useUserRecord()
  const getQuery = useCallback(
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
  let [isLoading, isError, species] = useDataStore(getQuery, 'view-species')
  const classes = useStyles()

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isError) {
    return <ErrorMessage>Failed to load species</ErrorMessage>
  }

  if (!species || (!isFirebaseId && !species.length)) {
    return <ErrorMessage>Could not found that species</ErrorMessage>
  }

  species = Array.isArray(species) ? species[0] : species

  const titleWithoutSuffix = `${species[SpeciesFieldNames.pluralName]} | ${
    species[SpeciesFieldNames.shortDescription]
  }`

  return (
    <>
      <Helmet>
        <title>{titleWithoutSuffix} | VRCArena</title>
        <meta
          name="description"
          content={species[SpeciesFieldNames.shortDescription]}
        />
        <meta property="og:title" content={titleWithoutSuffix} />
        <meta property="og:type" content="website" />
        <meta
          property="og:description"
          content={getDescriptionForHtmlMeta(
            species[SpeciesFieldNames.shortDescription]
          )}
        />
        <meta
          property="og:url"
          content={getOpenGraphUrlForRouteUrl(
            routes.viewSpeciesWithVar.replace(':speciesIdOrSlug', species.id)
          )}
        />
        <meta
          property="og:image"
          content={fixAccessingImagesUsingToken(
            species[SpeciesFieldNames.thumbnailUrl]
          )}
        />
      </Helmet>
      <div className={classes.thumbnailWrapper}>
        <a
          href={species[SpeciesFieldNames.thumbnailSourceUrl]}
          title={`Visit the source of the thumbnail for ${
            species[SpeciesFieldNames.pluralName]
          }`}
          target="_blank"
          rel="noopener noreferrer">
          <img
            src={fixAccessingImagesUsingToken(
              species[SpeciesFieldNames.thumbnailUrl]
            )}
            alt={`Thumbnail for species ${
              species[SpeciesFieldNames.pluralName]
            }`}
            className={classes.thumbnail}
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
          {species[SpeciesFieldNames.pluralName]}
        </Link>
      </Heading>
      <BodyText>
        <Markdown source={species[SpeciesFieldNames.description]} />
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
                species.id
              )
            }>
            Edit
          </Button>
        </>
      )}
      <LazyLoad>
        <RecentAssets
          speciesId={species.id}
          limit={5}
          categoryName={AssetCategories.avatar}
          showPinned
          title="Avatars"
        />
      </LazyLoad>
      <LazyLoad>
        <RecentAssets
          speciesId={species.id}
          limit={5}
          categoryName={AssetCategories.article}
          title="News"
        />
      </LazyLoad>
      <LazyLoad>
        <RecentAssets
          speciesId={species.id}
          limit={5}
          categoryName={AssetCategories.accessory}
          title="Recent Accessories"
        />
      </LazyLoad>
      <LazyLoad>
        <RecentAssets
          speciesId={species.id}
          limit={5}
          categoryName={AssetCategories.animation}
          title="Recent Animations"
        />
      </LazyLoad>
      <LazyLoad>
        <RecentAssets
          speciesId={species.id}
          limit={5}
          categoryName={AssetCategories.tutorial}
          title="Recent Tutorials"
        />
      </LazyLoad>
      <LazyLoad>
        <RecentAssets
          speciesId={species.id}
          limit={5}
          categoryName={AssetCategories.alteration}
          title="Recent Alterations"
        />
      </LazyLoad>
    </>
  )
}

function OtherSpecies() {
  const classes = useStyles()

  const species = {
    [SpeciesFieldNames.pluralName]: 'Other Species',
    [SpeciesFieldNames.description]: 'Assets that do not have a species.',
    [SpeciesFieldNames.shortDescription]: 'Assets that do not have a species.'
  }

  const titleWithoutSuffix = `${species[SpeciesFieldNames.pluralName]} | ${
    species[SpeciesFieldNames.shortDescription]
  }`

  return (
    <>
      <Helmet>
        <title>{titleWithoutSuffix} | VRCArena</title>
        <meta
          name="description"
          content={species[SpeciesFieldNames.shortDescription]}
        />
        <meta property="og:title" content={titleWithoutSuffix} />
        <meta property="og:type" content="website" />
        <meta
          property="og:description"
          content={getDescriptionForHtmlMeta(
            species[SpeciesFieldNames.shortDescription]
          )}
        />
        <meta
          property="og:url"
          content={getOpenGraphUrlForRouteUrl(
            routes.viewSpeciesWithVar.replace(':speciesIdOrSlug', species.id)
          )}
        />
        <meta
          property="og:image"
          content={species[SpeciesFieldNames.thumbnailUrl]}
        />
      </Helmet>
      <Heading variant="h1">
        <Link
          to={routes.viewSpeciesWithVar.replace(
            ':speciesIdOrSlug',
            otherSpeciesSlug
          )}>
          {species[SpeciesFieldNames.pluralName]}
        </Link>
      </Heading>
      <BodyText>
        <Markdown className={classes.description}>
          {species[SpeciesFieldNames.description]}
        </Markdown>
      </BodyText>
      <LazyLoad>
        <RecentAssets
          speciesId={false}
          limit={999}
          categoryName={AssetCategories.avatar}
          showPinned
          title="Avatars"
        />
      </LazyLoad>
      <LazyLoad>
        <RecentAssets
          speciesId={false}
          limit={5}
          categoryName={AssetCategories.article}
          title="News"
        />
      </LazyLoad>
      <LazyLoad>
        <RecentAssets
          speciesId={false}
          limit={5}
          categoryName={AssetCategories.accessory}
          title="Recent Accessories"
        />
      </LazyLoad>
      <LazyLoad>
        <RecentAssets
          speciesId={false}
          limit={5}
          categoryName={AssetCategories.animation}
          title="Recent Animations"
        />
      </LazyLoad>
      <LazyLoad>
        <RecentAssets
          speciesId={false}
          limit={5}
          categoryName={AssetCategories.tutorial}
          title="Recent Tutorials"
        />
      </LazyLoad>
    </>
  )
}

export default () => {
  const { speciesIdOrSlug } = useParams()

  return (
    <>
      <Helmet>
        <title>View species | VRCArena</title>
        <meta
          name="description"
          content="View the info and assets of a species on the site."
        />
      </Helmet>
      {speciesIdOrSlug === otherSpeciesSlug ? (
        <OtherSpecies />
      ) : (
        <SpeciesResult speciesIdOrSlug={speciesIdOrSlug} />
      )}
    </>
  )
}
