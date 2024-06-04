import React, { Fragment, useCallback, useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { useHistory, useParams } from 'react-router'
import EditIcon from '@material-ui/icons/Edit'
import { PostgrestFilterBuilder } from '@supabase/postgrest-js'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import CheckBoxIcon from '@material-ui/icons/CheckBox'

import Link from '../../components/link'
import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import PaginatedView from '../../components/paginated-view'
import AssetResults from '../../components/asset-results'
import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import RedirectMessage from '../../components/redirect-message'
import Button from '../../components/button'

import useIsAdultContentEnabled from '../../hooks/useIsAdultContentEnabled'
import useIsEditor from '../../hooks/useIsEditor'
import useDataStore from '../../hooks/useDataStore'

import { AssetCategory, PublicAsset } from '../../modules/assets'
import {
  CollectionNames,
  FullSpecies,
  Species,
  ViewNames,
} from '../../modules/species'

import * as routes from '../../routes'
import { prepareValueForQuery } from '../../queries'
import { client as supabase } from '../../supabase'
import { trackAction } from '../../analytics'

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

  const getQuery = useCallback(
    (
      query: PostgrestFilterBuilder<PublicAsset>
    ): PostgrestFilterBuilder<PublicAsset> => {
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
      viewName="getPublicAssets"
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
          color="default">
          Child Species
        </Button>,
      ]}>
      <Renderer />
    </PaginatedView>
  )
}

const View = () => {
  const { speciesIdOrSlug } = useParams<{
    speciesIdOrSlug: string
    categoryName: string
  }>()
  const isEditor = useIsEditor()
  const getSpeciesQuery = useCallback(
    () =>
      supabase
        .from<Species>(ViewNames.GetFullSpecies)
        .select('*')
        // TODO: Type safe this
        .or(`id.eq.${speciesIdOrSlug},slug.eq.${speciesIdOrSlug}`),
    [speciesIdOrSlug]
  )
  const [isLoadingSpecies, isErrorLoadingSpecies, speciesResults] =
    useDataStore<FullSpecies[]>(getSpeciesQuery, 'view-species')

  const species =
    speciesResults && speciesResults.length === 1 ? speciesResults[0] : null

  const getChildrenQuery = useCallback(() => {
    if (!species) {
      return null
    }
    const query = supabase
      .from<Species>(CollectionNames.Species)
      .select('*')
      .eq('parent', species.id)
    return query
  }, [species && species.id])
  const [isLoadingChildren, isErrorLoadingChildren, childSpecies] =
    useDataStore<Species[]>(
      species ? getChildrenQuery : null,
      'view-species-children'
    )
  const { push } = useHistory()

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

  if (isErrorLoadingSpecies || isErrorLoadingChildren) {
    return <ErrorMessage>Failed to load species</ErrorMessage>
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
        <Button
          url={routes.editSpeciesWithVar.replace(':speciesId', species.id)}
          icon={<EditIcon />}>
          Edit Species
        </Button>
      ) : null}
      <div>
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
        <Heading variant="h1" inline>
          <Link
            to={routes.viewSpeciesWithVar.replace(
              ':speciesIdOrSlug',
              species.id
            )}>
            {species.pluralname}
          </Link>{' '}
          ({species.avatarcount})
        </Heading>
      </div>
      <BodyText>{species.description || species.shortdescription}</BodyText>
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
