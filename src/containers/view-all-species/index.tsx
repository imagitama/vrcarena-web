import React, { useState } from 'react'
import { Helmet } from 'react-helmet'
import Link from '../../components/link'
import AddIcon from '@material-ui/icons/Add'
import { makeStyles } from '@material-ui/core/styles'

import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import Button from '../../components/button'

import { trackAction } from '../../analytics'
import useIsEditor from '../../hooks/useIsEditor'
import useDatabaseQuery, {
  CollectionNames,
  Operators,
  options,
  OrderDirections,
  SpeciesFieldNames
} from '../../hooks/useDatabaseQuery'
import * as routes from '../../routes'
import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import { FullSpecies, Species, ViewNames } from '../../modules/species'
import SuccessMessage from '../../components/success-message'
import AutocompleteInput from '../../components/autocomplete-input'
import {
  mediaQueryForMobiles,
  mediaQueryForTablets,
  mediaQueryForTabletsOrBelow
} from '../../media-queries'
import { findItemAndParents } from '../../utils'

const description =
  'Avatars in VR social games can be grouped into different species. Here is a list of all species that we know about in VR social games from Avalis to Dutch Angel Dragons to Digimon.'
const analyticsCategory = 'ViewAllSpecies'

const useStyles = makeStyles({
  speciesResults: {
    marginTop: '0.5rem',
    display: 'flex',
    flexWrap: 'wrap'
  },
  speciesItem: {
    width: '33.3%',
    padding: '0.25rem',
    '& a': {
      color: 'inherit',
      display: 'block',
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.1)'
      }
    },
    [mediaQueryForTablets]: {
      width: '50%'
    },
    [mediaQueryForMobiles]: {
      width: '100%'
    },
    '& $speciesItem': {
      width: '100%'
    }
  },
  speciesItemTitle: {
    display: 'flex',
    alignItems: 'center',
    '& img': {
      width: '100px',
      height: '100px',
      marginRight: '0.5rem'
    }
  },
  name: {
    fontSize: '150%',
    marginBottom: '0.1rem'
  },
  description: {
    fontSize: '75%',
    fontStyle: 'italic'
  },
  autocompleteWrapper: {
    marginBottom: '1rem',
    display: 'flex',
    justifyContent: 'center'
  },
  autocomplete: {
    width: '50%',
    [mediaQueryForTabletsOrBelow]: {
      width: '100%'
    }
  }
})

interface SpeciesWithChildren extends FullSpecies {
  children?: SpeciesWithChildren[]
}

function convertToNestedArray(
  arr: Species[],
  parentId: string | null = null
): SpeciesWithChildren[] {
  const nestedArray: SpeciesWithChildren[] = []
  for (const item of arr) {
    if (item.parent === parentId) {
      const children = convertToNestedArray(arr, item.id)
      if (children.length) {
        ;(item as SpeciesWithChildren).children = children
      }
      nestedArray.push(item as SpeciesWithChildren)
    }
  }
  return nestedArray
}

const SpeciesResult = ({
  speciesItem,
  indent = 0
}: {
  speciesItem: SpeciesWithChildren
  indent?: number
}) => {
  const classes = useStyles()
  return (
    <div
      className={classes.speciesItem}
      style={{ marginLeft: `calc(2rem * ${indent})` }}>
      <Link
        to={routes.viewSpeciesWithVar.replace(
          ':speciesIdOrSlug',
          speciesItem.slug || speciesItem.id
        )}>
        <div className={classes.speciesItemTitle}>
          <img src={speciesItem.thumbnailurl} />{' '}
          <div>
            <div className={classes.name}>
              {speciesItem.pluralname} ({speciesItem.avatarcount})
            </div>
            <div className={classes.description}>
              {speciesItem.shortdescription}
            </div>
          </div>
        </div>
      </Link>
      {speciesItem.children
        ? speciesItem.children.map(speciesChild => (
            <SpeciesResult speciesItem={speciesChild} indent={1} />
          ))
        : null}
    </div>
  )
}

const View = () => {
  const isEditor = useIsEditor()
  const [isLoading, isError, species] = useDatabaseQuery<Species>(
    ViewNames.GetFullSpecies,
    isEditor ? [] : [[SpeciesFieldNames.redirectTo, 'is', null]],
    {
      [options.orderBy]: [SpeciesFieldNames.singularName, OrderDirections.ASC]
    }
  )
  const [filterId, setFilterId] = useState<string | null>(null)
  const classes = useStyles()

  if (isLoading || !Array.isArray(species)) {
    return <LoadingIndicator message="Loading species..." />
  }

  if (isError) {
    return <ErrorMessage>Failed to load species</ErrorMessage>
  }

  const filteredSpecies =
    filterId !== null ? findItemAndParents<Species>(species, filterId) : species

  const speciesHierarchy = convertToNestedArray(filteredSpecies)

  return (
    <>
      <div className={classes.autocompleteWrapper}>
        <AutocompleteInput
          label="Search for species"
          options={species.map(speciesItem => ({
            label: speciesItem.pluralname,
            data: speciesItem.id
          }))}
          onSelectedOption={newOption => setFilterId(newOption.data)}
          className={classes.autocomplete}
          onClear={() => setFilterId(null)}
        />
      </div>
      <div className={classes.speciesResults}>
        {speciesHierarchy.map(speciesItem => (
          <SpeciesResult key={speciesItem.id} speciesItem={speciesItem} />
        ))}
      </div>
    </>
  )
}

export default () => {
  const isEditor = useIsEditor()
  return (
    <>
      <Helmet>
        <title>View all species | VRCArena</title>
        <meta name="description" content={description} />
      </Helmet>
      <Heading variant="h1">
        <Link to={routes.viewAllSpecies}>All Species</Link>
      </Heading>
      <BodyText>{description}</BodyText>
      {isEditor && (
        <>
          <Heading variant="h2">Actions</Heading>
          <Button
            url={routes.createSpecies}
            icon={<AddIcon />}
            onClick={() =>
              trackAction(analyticsCategory, 'Click create species button')
            }>
            Create
          </Button>
        </>
      )}
      <SuccessMessage>
        23 October update - all species have been re-organised into a
        multi-tiered system. Some have been renamed, split up or moved around.
        Please message on Discord if you like or dislike the new system!
      </SuccessMessage>
      <View />
    </>
  )
}
