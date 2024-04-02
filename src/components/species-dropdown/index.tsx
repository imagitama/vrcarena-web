import React from 'react'
import MenuItem from '@material-ui/core/MenuItem'

import useDataStoreItems from '../../hooks/useDataStoreItems'
import { CollectionNames, Species } from '../../modules/species'
import { SpeciesFieldNames } from '../../hooks/useDatabaseQuery'

import ErrorMessage from '../error-message'
import LoadingIndicator from '../loading-indicator'
import Select from '../select'

// cache for bulk edit
let lastKnownAllSpecies: Species[]

const SpeciesSelector = ({
  selectedSpeciesIds = [],
  onSpeciesClickWithId,
}: {
  selectedSpeciesIds: string[]
  onSpeciesClickWithId: (id: string) => void
}) => {
  const [isLoading, isError, newSpecies] = useDataStoreItems<Species>(
    lastKnownAllSpecies ? '' : CollectionNames.Species,
    undefined,
    'species-dropdown',
    SpeciesFieldNames.pluralName
  )

  if (newSpecies) {
    lastKnownAllSpecies = newSpecies
  }

  const allSpecies = lastKnownAllSpecies || newSpecies

  if ((!lastKnownAllSpecies && isLoading) || !allSpecies) {
    return <LoadingIndicator message="Loading species..." />
  }

  if (isError) {
    return <ErrorMessage>Failed to load species</ErrorMessage>
  }

  return (
    <Select multiple value={selectedSpeciesIds}>
      {allSpecies.map((speciesItem) => (
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
