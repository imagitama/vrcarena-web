import React from 'react'
import MenuItem from '@material-ui/core/MenuItem'

import useDataStoreItems from '../../hooks/useDataStoreItems'
import { CollectionNames, Species } from '../../modules/species'
import { SpeciesFieldNames } from '../../hooks/useDatabaseQuery'

import ErrorMessage from '../error-message'
import LoadingIndicator from '../loading-indicator'
import Select from '../select'

interface SpeciesWithChildren extends Species {
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

const SpeciesSelector = ({
  selectedSpeciesIds = [],
  onSpeciesClickWithId
}: {
  selectedSpeciesIds: string[]
  onSpeciesClickWithId: (id: string) => void
}) => {
  const [isLoading, isError, allSpecies] = useDataStoreItems<Species>(
    CollectionNames.Species,
    'species-dropdown',
    SpeciesFieldNames.pluralName
  )

  if (isLoading || !allSpecies) {
    return <LoadingIndicator message="Loading species..." />
  }

  if (isError) {
    return <ErrorMessage>Failed to load species</ErrorMessage>
  }

  const speciesHierarchy = convertToNestedArray(allSpecies)

  return (
    <Select multiple value={selectedSpeciesIds}>
      {allSpecies.map(speciesItem => (
        <MenuItem
          key={speciesItem.id}
          value={speciesItem.id}
          onClick={() => onSpeciesClickWithId(speciesItem.id)}>
          {speciesItem.pluralname}
        </MenuItem>
      ))}
    </Select>
  )
}

export default SpeciesSelector
