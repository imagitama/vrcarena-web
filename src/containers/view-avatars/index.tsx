import React, { useCallback, useState } from 'react'
import { Helmet } from 'react-helmet'
import { makeStyles } from '@material-ui/core/styles'
import CategoryIcon from '@material-ui/icons/Category'
import PetsIcon from '@material-ui/icons/Pets'
import ShuffleIcon from '@material-ui/icons/Shuffle'

import Link from '../../components/link'
import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import PaginatedView from '../../components/paginated-view'
import AssetResults from '../../components/asset-results'
import Button from '../../components/button'

import {
  AssetCategories,
  AssetFieldNames,
  OrderDirections,
  SpeciesFieldNames
} from '../../hooks/useDatabaseQuery'
import useIsAdultContentEnabled from '../../hooks/useIsAdultContentEnabled'
import useStorage from '../../hooks/useStorage'

import categoryMeta from '../../category-meta'
import * as routes from '../../routes'
import { scrollToTop } from '../../utils'

import Filters from './components/filters'
import { trackAction } from '../../analytics'
import useSorting from '../../hooks/useSorting'
import { Asset } from '../../modules/assets'

function getDisplayNameByCategoryName(categoryName: string): string {
  return categoryMeta[categoryName].name
}

function getDescriptionByCategoryName(categoryName: string): string {
  return categoryMeta[categoryName].shortDescription
}

const useStyles = makeStyles({
  species: {
    position: 'relative'
  },
  unexpanded: {
    height: '100px',
    overflow: 'hidden'
  },
  overlay: {
    height: '100%',
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    background: 'linear-gradient(rgba(0, 0, 0, 0) 0%, #282828 100%)',
    cursor: 'pointer',
    '& span': {
      textShadow: '1px 1px 1px #000',
      position: 'absolute',
      top: '50%',
      left: '0',
      width: '100%',
      textAlign: 'center',
      fontWeight: 'bold'
    }
  },
  page: {
    position: 'relative'
  },
  controls: {
    position: 'absolute',
    top: 0,
    right: 0,
    display: 'flex'
  },
  control: {
    marginLeft: '0.25rem'
  },
  moreAvatarsOnNextPageMessage: {
    textAlign: 'center',
    textShadow: '1px 1px 1px #000',
    fontWeight: 'bold',
    padding: '1rem 0'
  },
  speciesHeading: {
    position: 'relative'
  },
  scrollToTopBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
    cursor: 'pointer',
    opacity: 0.75,
    '&:hover': {
      opacity: 1
    }
  }
})

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
      {/* {areFiltersVisible && <Filters />} */}
      <Avatars avatars={items || []} />
    </>
  )
}

const sortKey = 'view-avatars'
const defaultFieldName = 'createdat'
const avatarsFiltersStorageKey = 'avatar-filters'

function MoreAvatarsOnNextPage({ remainingCount }: { remainingCount: number }) {
  const classes = useStyles()

  // NOTE: NSFW assets not included so "or more"
  return (
    <div className={classes.moreAvatarsOnNextPageMessage}>
      There are {remainingCount} or more avatars on the next page for this
      species
    </div>
  )
}

const useActiveFilters = () => {
  const [activeFilters] = useStorage<string[]>(avatarsFiltersStorageKey, [])
  return activeFilters || []
}

const endorsementCountFieldName = 'endorsementcount'

export default () => {
  const categoryName = AssetCategories.avatar
  const isAdultContentEnabled = useIsAdultContentEnabled()
  const [areFiltersVisible, setAreFiltersVisible] = useState(false)
  const activeFilters = useActiveFilters()
  const [sorting] = useSorting(sortKey, defaultFieldName)
  // @ts-ignore
  const bySpecies: boolean = sorting && sorting.fieldName === defaultFieldName

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
            // not working as of april 2023
            // <Button
            //   onClick={() => setAreFiltersVisible(currentVal => !currentVal)}
            //   icon={<CategoryIcon />}>
            //   Filters
            //   {activeFilters.length ? ` (${activeFilters.length})` : ''}
            // </Button>
          ]}
          urlWithPageNumberVar={routes.viewAvatarsWithPageVar}
          getQueryString={() => `category:${AssetCategories.avatar}`}>
          <Renderer />
        </PaginatedView>
      </div>
    </>
  )
}
