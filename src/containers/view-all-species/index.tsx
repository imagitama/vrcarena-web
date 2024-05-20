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
  Operators,
  options,
  OrderDirections,
  SpeciesFieldNames,
} from '../../hooks/useDatabaseQuery'
import * as routes from '../../routes'
import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import { FullSpecies, Species, ViewNames } from '../../modules/species'
import AutocompleteInput from '../../components/autocomplete-input'
import {
  mediaQueryForMobiles,
  mediaQueryForTablets,
  mediaQueryForTabletsOrBelow,
} from '../../media-queries'
import { findItemAndParents } from '../../utils'
import SpeciesResultItem from '../../components/species-result-item'

const description =
  'Avatars in VR social games can be grouped into different species. Here is a list of all species that we know about in VR social games from Avalis to Dutch Angel Dragons to Digimon.'
const analyticsCategory = 'ViewAllSpecies'

const useStyles = makeStyles({
  speciesResults: {
    marginTop: '0.5rem',
    display: 'flex',
    flexWrap: 'wrap',
  },
  autocompleteWrapper: {
    marginBottom: '1rem',
    display: 'flex',
    justifyContent: 'center',
  },
  autocomplete: {
    width: '50%',
    [mediaQueryForTabletsOrBelow]: {
      width: '100%',
    },
  },
  speciesItem: {
    width: '33.3%',
    [mediaQueryForTablets]: {
      width: '50%',
    },
    [mediaQueryForMobiles]: {
      width: '100%',
    },
    '& $speciesItem': {
      width: '100%',
    },
  },
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

const View = () => {
  const isEditor = useIsEditor()
  const [isLoading, isError, speciesItems] = useDatabaseQuery<Species>(
    ViewNames.GetFullSpecies,
    isEditor ? [] : [['redirectto', Operators.IS, null]],
    {
      [options.orderBy]: ['singularname', OrderDirections.ASC],
    }
  )
  const [filterId, setFilterId] = useState<string | null>(null)
  const classes = useStyles()

  if (isLoading || !Array.isArray(speciesItems)) {
    return <LoadingIndicator message="Loading species..." />
  }

  if (isError) {
    return <ErrorMessage>Failed to load species</ErrorMessage>
  }

  const filteredSpecies =
    filterId !== null
      ? findItemAndParents<Species>(speciesItems, filterId)
      : speciesItems

  const speciesHierarchy = convertToNestedArray(filteredSpecies)

  return (
    <>
      <div className={classes.autocompleteWrapper}>
        <AutocompleteInput
          label="Search for species"
          options={speciesItems.map((speciesItem) => ({
            label: speciesItem.pluralname,
            data: speciesItem.id,
          }))}
          filterOptions={(options, searchTerm) =>
            options.filter((option) =>
              option.label.toLowerCase().includes(searchTerm.toLowerCase())
            )
          }
          onSelectedOption={(newOption) => setFilterId(newOption.data)}
          className={classes.autocomplete}
          onClear={() => setFilterId(null)}
          textFieldProps={{
            fullWidth: true,
            autoFocus: true,
          }}
        />
      </div>
      <div className={classes.speciesResults}>
        {speciesHierarchy.map((speciesItem) => (
          <SpeciesResultItem
            key={speciesItem.id}
            speciesItem={speciesItem}
            className={classes.speciesItem}>
            {speciesItem.children
              ? speciesItem.children.map((speciesChild) => (
                  <SpeciesResultItem speciesItem={speciesChild} indent={1} />
                ))
              : null}
          </SpeciesResultItem>
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
      <View />
    </>
  )
}
