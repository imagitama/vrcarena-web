import React, { Fragment, useCallback, useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { useHistory, useParams } from 'react-router'
import EditIcon from '@mui/icons-material/Edit'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import { makeStyles } from '@mui/styles'

import Link from '../../components/link'
import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import PaginatedView, { GetQueryFn } from '../../components/paginated-view'
import AssetResults from '../../components/asset-results'
import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import RedirectMessage from '../../components/redirect-message'
import Button from '../../components/button'

import useIsAdultContentEnabled from '../../hooks/useIsAdultContentEnabled'
import useIsEditor from '../../hooks/useIsEditor'
import useDataStore, {
  GetQueryFn as GetQueryFnDataStore,
} from '../../hooks/useDataStore'

import {
  AssetCategory,
  PublicAsset,
  ViewNames as AssetsViewNames,
} from '../../modules/assets'
import {
  CollectionNames,
  FullSpecies,
  Species,
  ViewNames,
} from '../../modules/species'

import * as routes from '../../routes'
import { prepareValueForQuery } from '../../queries'
import { trackAction } from '../../analytics'
import useDataStoreFunction from '../../hooks/useDataStoreFunction'
import { handleError } from '../../error-handling'
import { GetQuery } from '../../data-store'
import { SupabaseClient } from '@supabase/supabase-js'

const Renderer = ({ items }: { items?: PublicAsset[] }) => (
  <AssetResults assets={items} />
)

const analyticsCategoryName = 'ViewSpecies'

const AssetsForSpecies = ({
  species,
  childSpecies,
}: {
  species: Species
  childSpecies: Species[]
}) => {
  const isAdultContentEnabled = useIsAdultContentEnabled()
  const [includeChildren, setIncludeChildren] = useState(true)

  const speciesIdsToSearchFor = [
    species.id,
    ...(includeChildren
      ? childSpecies.map((childSpeciesItem) => childSpeciesItem.id)
      : []),
  ]

  const getQuery = useCallback<GetQueryFn<PublicAsset>>(
    (query) => {
      query = query
        .overlaps('species', speciesIdsToSearchFor)
        .eq('category', AssetCategory.Avatar)

      if (!isAdultContentEnabled) {
        query = query.eq('isadult', false)
      }

      return query
    },
    [speciesIdsToSearchFor.join(','), isAdultContentEnabled]
  )

  return (
    <PaginatedView<PublicAsset>
      viewName={AssetsViewNames.GetPublicAssets}
      getQuery={getQuery}
      sortKey="view-category"
      sortOptions={[
        {
          label: 'Submission date',
          fieldName: 'createdat',
        },
        {
          label: 'Title',
          fieldName: 'title',
        },
      ]}
      defaultFieldName="createdat"
      urlWithPageNumberVar={routes.viewSpeciesCategoryWithVarAndPageNumberVar
        .replace(':speciesIdOrSlug', species.id)
        .replace(':categoryName', AssetCategory.Avatar)}
      getQueryString={() =>
        `species:${prepareValueForQuery(species.pluralname)} category:${
          AssetCategory.Avatar
        }`
      }
      extraControls={[
        <Button
          icon={
            includeChildren ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />
          }
          onClick={() => {
            setIncludeChildren((currentVal) => !currentVal)
            trackAction(
              analyticsCategoryName,
              'Click on toggle include children'
            )
          }}
          color="secondary">
          Child Species
        </Button>,
      ]}>
      <Renderer />
    </PaginatedView>
  )
}

const useStyles = makeStyles({
  headings: {
    display: 'flex',
    alignItems: 'center',
  },
  mainHeading: {
    display: 'inline-flex',
    alignItems: 'center',
    '& a': {
      display: 'flex',
      alignItems: 'center',
      marginRight: '0.5rem',
    },
    '& img': {
      height: '50px',
      margin: '0 0.5rem',
    },
  },
})

interface RandomlyUpdateSpeciesThumbnailResult {
  randomly_update_all_species_thumbnails: number
}

const View = () => {
  const { speciesIdOrSlug } = useParams<{
    speciesIdOrSlug: string
    categoryName: string
  }>()
  const isEditor = useIsEditor()
  const getSpeciesQuery = useCallback<GetQueryFnDataStore<FullSpecies>>(
    (client) =>
      client
        .from(ViewNames.GetFullSpecies)
        .select<string, FullSpecies>('*')
        // TODO: Type safe this
        .or(`id.eq.${speciesIdOrSlug},slug.eq.${speciesIdOrSlug}`),
    [speciesIdOrSlug]
  )
  const [
    isLoadingSpecies,
    lastErrorCodeLoadingSpecies,
    speciesResults,
    ,
    hydrate,
  ] = useDataStore<FullSpecies>(getSpeciesQuery, 'view-species')
  const classes = useStyles()

  const species =
    speciesResults && speciesResults.length === 1 ? speciesResults[0] : null

  const getChildrenQuery = useCallback(
    (supabase: SupabaseClient) => {
      if (!species) {
        return null
      }
      const query = supabase
        .from(CollectionNames.Species)
        .select<'*', Species>('*')
        .eq('parent', species.id)
      return query
    },
    [species && species.id]
  )
  const [isLoadingChildren, lastErrorCodeLoadingChildren, childSpecies] =
    useDataStore<Species>(
      species ? getChildrenQuery : null,
      'view-species-children'
    )
  const { push } = useHistory()
  const [
    isUpdatingThumbnail,
    lastErrorCode,
    lastThumbnailUpdateResult,
    randomlyUpdateSpeciesThumbnailResult,
  ] = useDataStoreFunction<
    { speciesid: string },
    RandomlyUpdateSpeciesThumbnailResult
  >('randomly_update_species_thumbnail')

  useEffect(() => {
    if (!species || !species.redirectto) {
      return
    }

    const timeout = setTimeout(
      () =>
        push(
          routes.viewSpeciesWithVar.replace(
            ':speciesIdOrSlug',
            species.redirectto
          )
        ),
      1000
    )

    return () => {
      clearTimeout(timeout)
    }
  }, [species && species.redirectto])

  if (isLoadingSpecies || !species || isLoadingChildren || !childSpecies) {
    return <LoadingIndicator message="Loading species..." />
  }

  if (
    lastErrorCodeLoadingSpecies !== null ||
    lastErrorCodeLoadingChildren !== null
  ) {
    return (
      <ErrorMessage>
        Failed to load species (code{' '}
        {lastErrorCodeLoadingSpecies || lastErrorCodeLoadingChildren})
      </ErrorMessage>
    )
  }

  if (species.redirectto) {
    return <RedirectMessage />
  }

  return (
    <>
      <Helmet>
        <title>
          {species.pluralname} | {species.shortdescription} | VRCArena
        </title>
        <meta
          name="description"
          content={species.description || species.shortdescription}
        />
      </Helmet>
      {isEditor ? (
        <>
          <Button
            url={routes.editSpeciesWithVar.replace(':speciesId', species.id)}
            icon={<EditIcon />}>
            Edit Species
          </Button>
          <Button
            onClick={async () => {
              try {
                await randomlyUpdateSpeciesThumbnailResult({
                  speciesid: speciesIdOrSlug,
                })
                await hydrate()
              } catch (err) {
                console.error(err)
                handleError(err)
              }
            }}
            color="secondary"
            isDisabled={isUpdatingThumbnail}>
            Regenerate Thumbnail
            {lastErrorCode !== null ? ` failed: ${lastErrorCode}` : ''}
          </Button>
        </>
      ) : null}
      <div className={classes.headings}>
        <Heading variant="h2" inline>
          <Link to={routes.viewAllSpecies}>All</Link>
          {species.parentpluralname ? (
            <>
              {' / '}
              <Link
                to={routes.viewSpeciesWithVar.replace(
                  ':speciesIdOrSlug',
                  species.parent
                )}>
                {species.parentpluralname}
              </Link>
            </>
          ) : null}
          {' / '}
        </Heading>
        <Heading variant="h1" inline className={classes.mainHeading}>
          <Link
            to={routes.viewSpeciesWithVar.replace(
              ':speciesIdOrSlug',
              species.id
            )}>
            {species.thumbnailurl ? (
              <img src={species.thumbnailurl} alt="Thumbnail for species" />
            ) : null}
            {species.pluralname}
          </Link>{' '}
          {species.avatarcount ? `(${species.avatarcount})` : ''}
        </Heading>
      </div>
      <BodyText>{species.description || species.shortdescription}</BodyText>
      {species.thumbnailsourceurl ? (
        <a href={species.thumbnailsourceurl}>Thumbnail source</a>
      ) : null}
      {childSpecies.length ? (
        <Heading variant="h2">
          Children:{' '}
          {childSpecies.map((childSpeciesItem, idx) => (
            <Fragment key={childSpeciesItem.id}>
              {idx > 0 ? ', ' : ''}
              <Link
                to={routes.viewSpeciesWithVar.replace(
                  ':speciesIdOrSlug',
                  childSpeciesItem.id
                )}>
                {childSpeciesItem.pluralname}
              </Link>
            </Fragment>
          ))}
        </Heading>
      ) : null}
      <AssetsForSpecies species={species} childSpecies={childSpecies} />
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
