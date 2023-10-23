import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import useDataStoreItems from '../../hooks/useDataStoreItems'
import { CollectionNames, Species } from '../../modules/species'
import ErrorMessage from '../error-message'
import LoadingIndicator from '../loading-indicator'
import { SpeciesFieldNames } from '../../hooks/useDatabaseQuery'

interface SpeciesWithChildren extends Species {
  children?: SpeciesWithChildren[]
}

const useStyles = makeStyles({
  speciesItem: {
    marginBottom: '0.25rem',
    '&:hover': {
      cursor: 'pointer'
    }
  },
  speciesItemTitle: {
    display: 'flex',
    alignItems: 'center',
    '& img': {
      width: '50px',
      height: '50px',
      marginRight: '0.5rem'
    }
  },
  selected: {
    '& img': {
      borderRadius: '5px',
      outline: '2px solid yellow'
    }
  }
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
  onSpeciesClickWithId
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
          ? e => {
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
        ? speciesItem.children.map(speciesChild => (
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
  onSpeciesClickWithId
}: {
  selectedSpeciesIds?: string[]
  onSpeciesClickWithId?: (id: string) => void
}) => {
  const [isLoading, isError, allSpecies] = useDataStoreItems<Species>(
    CollectionNames.Species,
    'species-selector',
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
    <div>
      {speciesHierarchy.map(speciesItem => (
        <SpeciesOutput
          key={speciesItem.id}
          speciesItem={speciesItem}
          selectedSpeciesIds={selectedSpeciesIds}
          onSpeciesClickWithId={onSpeciesClickWithId}
        />
      ))}
    </div>
  )
}

export default SpeciesSelector
