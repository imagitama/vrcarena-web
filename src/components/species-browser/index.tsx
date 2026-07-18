import React, { useEffect, useMemo, useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry'
import { makeStyles } from '@mui/styles'

import { trackAction } from '@/analytics'
import * as routes from '@/routes'
import { FullSpecies, Species } from '@/modules/species'
import {
  mediaQueryForMobiles,
  mediaQueryForTabletsOrBelow,
} from '@/media-queries'
import { findItemAndParents, getAreArraysSame, getRandomInt } from '@/utils'

import useIsEditor from '@/hooks/useIsEditor'

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

function getIsDescendantSelected(
  item: SpeciesWithChildren,
  selectedSpeciesIds: string[]
): boolean {
  return !!item.children?.some(
    (child) =>
      selectedSpeciesIds.includes(child.id) ||
      getIsDescendantSelected(child, selectedSpeciesIds)
  )
}

function getIsAncestorSelected(
  ancestorIds: string[],
  selectedSpeciesIds: string[]
): boolean {
  return ancestorIds.some((id) => selectedSpeciesIds.includes(id))
}

function getCanSelectSpecies(
  item: SpeciesWithChildren,
  ancestorIds: string[],
  selectedSpeciesIds: string[]
): boolean {
  if (getIsAncestorSelected(ancestorIds, selectedSpeciesIds)) return false

  const descendantSelected = getIsDescendantSelected(item, selectedSpeciesIds)
  if (!descendantSelected) return true

  return selectedSpeciesIds.includes(item.id)
}

interface SpeciesTreeNodeProps {
  speciesItem: SpeciesWithChildren
  ancestorIds: string[]
  depth: number
  index?: number
  className?: string
  onClickSpecies?: (id: string) => void
  selectedSpeciesIds?: string[]
}

const SpeciesTreeNode = ({
  speciesItem,
  ancestorIds,
  depth,
  index,
  onClickSpecies,
  selectedSpeciesIds,
}: SpeciesTreeNodeProps) => {
  const classes = useStyles()

  const isSelectable =
    !!onClickSpecies &&
    !!selectedSpeciesIds &&
    getCanSelectSpecies(speciesItem, ancestorIds, selectedSpeciesIds)

  const isSelected = !!selectedSpeciesIds?.includes(speciesItem.id)

  const isSelectedByParent =
    depth > 0 &&
    !!selectedSpeciesIds &&
    getIsAncestorSelected(ancestorIds, selectedSpeciesIds)

  const handleClick = onClickSpecies
    ? (id: string) => {
        if (
          !selectedSpeciesIds ||
          getCanSelectSpecies(speciesItem, ancestorIds, selectedSpeciesIds)
        ) {
          onClickSpecies(id)
        }
      }
    : undefined

  return (
    <SpeciesResultItem
      key={speciesItem.id}
      speciesItem={speciesItem}
      className={classes.speciesItem}
      index={index}
      indent={depth}
      onClick={handleClick}
      isSelectable={isSelectable}
      isSelected={isSelected}
      isSelectedByParent={isSelectedByParent}>
      {speciesItem.children?.length
        ? speciesItem.children.map((child, childIndex) => (
            <SpeciesTreeNode
              key={child.id}
              speciesItem={child}
              index={childIndex}
              ancestorIds={[...ancestorIds, speciesItem.id]}
              depth={depth + 1}
              onClickSpecies={onClickSpecies}
              selectedSpeciesIds={selectedSpeciesIds}
            />
          ))
        : null}
    </SpeciesResultItem>
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
        <SpeciesTreeNode
          key={speciesItem.id}
          speciesItem={speciesItem}
          ancestorIds={[]}
          depth={0}
          onClickSpecies={onClickSpecies}
          selectedSpeciesIds={selectedSpeciesIds}
        />
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
      <CreateButton />
    </>
  )
}

export default SpeciesBrowser
