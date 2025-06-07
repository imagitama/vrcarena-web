import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import useDataStoreItems from '../../hooks/useDataStoreItems'
import { CollectionNames, Species } from '../../modules/species'
import ErrorMessage from '../error-message'
import LoadingIndicator from '../loading-indicator'
import AutocompleteInput from '../autocomplete-input'
import { findItemAndParents } from '../../utils'

interface SpeciesWithChildren extends Species {
  children?: SpeciesWithChildren[]
}

const useStyles = makeStyles({
  speciesResults: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  speciesItem: {
    padding: '0.25rem',
    '&:hover': {
      cursor: 'pointer',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
  },
  speciesItemTitle: {
    display: 'flex',
    alignItems: 'center',
    '& img': {
      width: '50px',
      height: '50px',
      marginRight: '0.5rem',
    },
  },
  selected: {
    outline: '2px solid yellow',
  },
})

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

const SpeciesOutput = ({
  speciesItem,
  indent,
  selectedSpeciesIds,
  onSpeciesClickWithId,
}: {
  speciesItem: SpeciesWithChildren
  indent?: number
  selectedSpeciesIds?: string[]
  onSpeciesClickWithId?: (id: string) => void
}) => {
  const classes = useStyles()
  const isSelected = selectedSpeciesIds
    ? selectedSpeciesIds.includes(speciesItem.id)
    : false
  return (
    <div
      className={`${classes.speciesItem} ${isSelected ? classes.selected : ''}`}
      style={{ marginLeft: indent ? indent * 10 : 0 }}
      onClick={
        onSpeciesClickWithId
          ? (e) => {
              e.stopPropagation()
              e.preventDefault()
              onSpeciesClickWithId(speciesItem.id)
              return false
            }
          : undefined
      }>
      <div className={classes.speciesItemTitle}>
        <img src={speciesItem.thumbnailurl} />{' '}
        <span>{speciesItem.pluralname}</span>
      </div>
      {speciesItem.children
        ? speciesItem.children.map((speciesChild) => (
            <SpeciesOutput
              speciesItem={speciesChild}
              indent={1}
              selectedSpeciesIds={selectedSpeciesIds}
              onSpeciesClickWithId={onSpeciesClickWithId}
            />
          ))
        : null}
    </div>
  )
}

const SpeciesSelector = ({
  selectedSpeciesIds,
  onSpeciesClickWithId,
}: {
  selectedSpeciesIds?: string[]
  onSpeciesClickWithId?: (id: string) => void
}) => {
  const [isLoading, isError, allSpecies] = useDataStoreItems<Species>(
    CollectionNames.Species,
    undefined,
    { queryName: 'species-selector', orderBy: 'pluralname' }
  )
  const [filterId, setFilterId] = useState<string | null>(null)
  const classes = useStyles()

  if (isLoading || !allSpecies) {
    return <LoadingIndicator message="Loading species..." />
  }

  if (isError) {
    return <ErrorMessage>Failed to load species</ErrorMessage>
  }

  const filteredSpecies =
    filterId !== null
      ? findItemAndParents<Species>(allSpecies, filterId)
      : allSpecies

  const speciesHierarchy = convertToNestedArray(filteredSpecies)

  return (
    <>
      <AutocompleteInput
        label="Search for species"
        options={allSpecies.map((speciesItem) => ({
          label: speciesItem.pluralname,
          data: speciesItem.id,
        }))}
        filterOptions={(options, searchTerm) =>
          options.filter((option) =>
            option.label.toLowerCase().includes(searchTerm.toLowerCase())
          )
        }
        onSelectedOption={(newOption: { data: string }) =>
          setFilterId(newOption.data)
        }
        onClear={() => setFilterId(null)}
        textFieldProps={{
          fullWidth: true,
        }}
      />

      <div className={classes.speciesResults}>
        {speciesHierarchy.map((speciesItem) => (
          <SpeciesOutput
            key={speciesItem.id}
            speciesItem={speciesItem}
            selectedSpeciesIds={selectedSpeciesIds}
            onSpeciesClickWithId={onSpeciesClickWithId}
          />
        ))}
      </div>
    </>
  )
}

export default SpeciesSelector
