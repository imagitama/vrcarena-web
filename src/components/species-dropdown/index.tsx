import React from 'react'
import MenuItem from '@mui/material/MenuItem'

import useDataStoreItems from '../../hooks/useDataStoreItems'
import { CollectionNames, Species } from '../../modules/species'

import ErrorMessage from '../error-message'
import LoadingIndicator from '../loading-indicator'
import Select from '../select'

// cache for bulk edit
let lastKnownAllSpecies: Species[]

const SpeciesDropdown = ({
  selectedSpeciesIds = [],
  onSpeciesClickWithId,
}: {
  selectedSpeciesIds: string[]
  onSpeciesClickWithId: (id: string) => void
}) => {
  const [isLoading, lastErrorCode, newSpecies] = useDataStoreItems<Species>(
    lastKnownAllSpecies ? '' : CollectionNames.Species,
    undefined,
    { queryName: 'species-dropdown', orderBy: 'pluralname' }
  )

  if (newSpecies) {
    lastKnownAllSpecies = newSpecies
  }

  const allSpecies = lastKnownAllSpecies || newSpecies

  if ((!lastKnownAllSpecies && isLoading) || !allSpecies) {
    return <LoadingIndicator message="Loading species..." />
  }

  if (lastErrorCode) {
    return (
      <ErrorMessage>Failed to load species (code {lastErrorCode})</ErrorMessage>
    )
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

export default SpeciesDropdown
