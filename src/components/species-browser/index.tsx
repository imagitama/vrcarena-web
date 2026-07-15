import React, { useEffect, useMemo, useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry'
import { makeStyles } from '@mui/styles'

import { trackAction } from '@/analytics'
import * as routes from '@/routes'
import { FullSpecies, Species, ViewNames } from '@/modules/species'
import {
  mediaQueryForMobiles,
  mediaQueryForTabletsOrBelow,
} from '@/media-queries'
import { findItemAndParents, getAreArraysSame, getRandomInt } from '@/utils'

import useIsEditor from '@/hooks/useIsEditor'
import useDatabaseQuery, {
  Operators,
  OrderDirections,
} from '@/hooks/useDatabaseQuery'
import useStorage from '@/hooks/useStorage'

import Button from '@/components/button'
import ErrorMessage from '@/components/error-message'
import SpeciesResultItem from '@/components/species-result-item'
import FormControls from '@/components/form-controls'
import AutocompleteInput from '@/components/autocomplete-input'
import useGlobalState from '@/hooks/useGlobalState'

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
    margin: '0 0.5rem 0.5rem 0',
  },
  // copies from paginated view
  controls: {
    display: 'flex',
    flexWrap: 'wrap',
    marginBottom: '0.25rem',
  },
  controlsLeft: {
    display: 'flex',
    '& > *:first-child': {
      marginLeft: 'auto',
    },
    [mediaQueryForMobiles]: {
      width: '100%',
      flexShrink: 1,
    },
  },
  controlsRight: {
    width: '100%',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'end',
    '& > *:first-child': {
      marginLeft: 'auto',
    },
  },
  controlGroup: {
    display: 'flex',
    marginLeft: '1rem',
    flexWrap: 'wrap',
    [mediaQueryForMobiles]: {
      margin: '0.1rem',
    },
  },
  control: {
    marginLeft: '0.5rem',
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
    const newItem = { ...item }
    if (newItem.parent === parentId) {
      const children = convertToNestedArray(arr, newItem.id)
      if (children.length) {
        ;(newItem as SpeciesWithChildren).children = children
      }
      nestedArray.push(newItem as SpeciesWithChildren)
    }
  }
  return nestedArray
}

interface SpeciesContainerSettings {
  grid: boolean // 3 cols
  groupChildren: boolean
}

const storageKey = 'speciescontainer'

const CreateButton = () => {
  const isEditor = useIsEditor()

  if (!isEditor) {
    return null
  }
  return (
    <>
      &nbsp;
      <Button
        url={routes.createSpecies}
        icon={<AddIcon />}
        onClick={() =>
          trackAction(analyticsCategory, 'Click create species button')
        }
        color="secondary"
        size="small"
        switchIconSide
        hollow>
        Create
      </Button>
    </>
  )
}

const SpeciesBrowser = ({
  selectedSpeciesIds,
  onClickSpecies,
  startCollapsed = false,
}: {
  selectedSpeciesIds?: string[]
  onClickSpecies?: (id: string) => void
  startCollapsed?: boolean
}) => {
  const [isLoading, lastErrorCode, globalState] = useGlobalState()
  const [filterIds, setFilterIds] = useState<string[]>([])
  const classes = useStyles()
  const loadingChildren = useMemo(
    () =>
      Array.from({ length: 6 }).map((_, i) => (
        <SpeciesResultItem shimmer key={i} className={classes.speciesItem}>
          {getRandomInt(0, 10) < 4 ? (
            <SpeciesResultItem shimmer index={0} indent={1} />
          ) : null}
        </SpeciesResultItem>
      )),
    []
  )
  const [isExpanded, setIsExpanded] = useState(!startCollapsed)

  const species = [...(globalState?.species || [])]
  const filteredSpecies = species.length
    ? filterIds.length > 0
      ? findItemAndParents<Species>(species, filterIds)
      : species
    : null

  const speciesHierarchy: SpeciesWithChildren[] | null = filteredSpecies
    ? convertToNestedArray(filteredSpecies)
    : null

  const children = speciesHierarchy
    ? speciesHierarchy.map((speciesItem) => (
        <SpeciesResultItem
          key={speciesItem.id}
          speciesItem={speciesItem}
          className={classes.speciesItem}
          onClick={
            onClickSpecies
              ? (id) => {
                  if (
                    selectedSpeciesIds &&
                    speciesItem.children &&
                    speciesItem.children.length
                  ) {
                    if (
                      !speciesItem.children.find((speciesChild) =>
                        selectedSpeciesIds.includes(speciesChild.id)
                      ) ||
                      // allow repairing assets that have both parent and child
                      (selectedSpeciesIds.includes(speciesItem.id) &&
                        speciesItem.children.find((speciesChild) =>
                          selectedSpeciesIds.includes(speciesChild.id)
                        ))
                    ) {
                      onClickSpecies(id)
                    }
                  } else {
                    onClickSpecies(id)
                  }
                }
              : undefined
          }
          isSelectable={
            onClickSpecies &&
            selectedSpeciesIds &&
            (speciesItem.children?.find((speciesChild) =>
              selectedSpeciesIds.includes(speciesChild.id)
            ) === undefined ||
              !speciesItem.children?.length)
              ? true
              : false
          }
          isSelected={
            selectedSpeciesIds && selectedSpeciesIds.includes(speciesItem.id)
          }>
          {speciesItem.children
            ? speciesItem.children.map((speciesChild, index) => (
                <SpeciesResultItem
                  key={speciesChild.id}
                  index={index}
                  speciesItem={speciesChild}
                  indent={1}
                  onClick={
                    onClickSpecies
                      ? (id) => {
                          if (selectedSpeciesIds) {
                            if (!selectedSpeciesIds.includes(speciesItem.id)) {
                              onClickSpecies(id)
                            }
                          } else {
                            onClickSpecies(id)
                          }
                        }
                      : undefined
                  }
                  isSelectable={
                    onClickSpecies &&
                    selectedSpeciesIds &&
                    !selectedSpeciesIds.includes(speciesItem.id)
                      ? true
                      : false
                  }
                  isSelected={
                    selectedSpeciesIds &&
                    selectedSpeciesIds.includes(speciesChild.id)
                  }
                  isSelectedByParent={
                    selectedSpeciesIds &&
                    selectedSpeciesIds.includes(speciesItem.id)
                  }
                />
              ))
            : null}
        </SpeciesResultItem>
      ))
    : null

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>Failed to load species (code {lastErrorCode})</ErrorMessage>
    )
  }

  if (startCollapsed && !isExpanded) {
    return (
      <FormControls>
        <Button onClick={() => setIsExpanded(true)}>Show Species List</Button>
      </FormControls>
    )
  }

  return (
    <>
      <div className={classes.autocompleteWrapper}>
        <AutocompleteInput
          label="Filter species"
          options={species.map((speciesItem) => ({
            label: `${speciesItem.pluralname}${
              speciesItem.singularname !== speciesItem.pluralname
                ? `/${speciesItem.singularname}`
                : ''
            }${
              speciesItem.tags.length ? ` (${speciesItem.tags.join(', ')})` : ''
            }`,
            data: speciesItem.id,
          }))}
          filterOptions={(options, searchTerm) =>
            options.filter((option) =>
              option.label.toLowerCase().includes(searchTerm.toLowerCase())
            )
          }
          onFilteredOptions={(opts) => {
            // warning: will cause infinite loop if we keep setting state
            if (opts.length < 5) {
              const newIds = opts.map((opt) => opt.data)
              if (!getAreArraysSame(newIds, filterIds)) {
                setFilterIds(newIds)
              }
            } else if (filterIds.length > 0) {
              setFilterIds([])
            }
          }}
          onSelectedOption={(newOption) => setFilterIds([newOption.data])}
          className={classes.autocomplete}
          onClear={() => setFilterIds([])}
          textFieldProps={{
            fullWidth: true,
            disabled: isLoading,
          }}
        />
      </div>
      <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}>
        <Masonry>{isLoading ? loadingChildren : children}</Masonry>
      </ResponsiveMasonry>
    </>
  )
}

export default SpeciesBrowser
