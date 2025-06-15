import React, { useEffect, useMemo, useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry'
import { makeStyles } from '@mui/styles'

import Button from '../../components/button'

import { trackAction } from '../../analytics'
import useIsEditor from '../../hooks/useIsEditor'
import useDatabaseQuery, {
  Operators,
  options,
  OrderDirections,
} from '../../hooks/useDatabaseQuery'
import * as routes from '../../routes'
import ErrorMessage from '../../components/error-message'
import { FullSpecies, Species, ViewNames } from '../../modules/species'
import AutocompleteInput from '../../components/autocomplete-input'
import {
  mediaQueryForMobiles,
  mediaQueryForTabletsOrBelow,
} from '../../media-queries'
import { findItemAndParents, getRandomInt } from '../../utils'
import SpeciesResultItem from '../../components/species-result-item'
import useStorage from '../../hooks/useStorage'

const analyticsCategory = 'ViewAllSpecies'

const useStyles = makeStyles({
  speciesResults: {
    marginTop: '0.5rem',
    display: 'flex',
    flexWrap: 'wrap',
  },
  autocompleteWrapper: {
    margin: '1rem 0',
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
        size="small">
        Create
      </Button>
    </>
  )
}

const SpeciesBrowser = ({
  selectedSpeciesIds,
  onClickSpecies,
  showControls = true,
}: {
  selectedSpeciesIds?: string[]
  onClickSpecies?: (id: string) => void
  showControls?: boolean
}) => {
  const [isLoading, lastErrorCode, speciesItems] = useDatabaseQuery<Species>(
    ViewNames.GetPublicSpeciesCache,
    [['redirectto', Operators.IS, null]],
    {
      [options.orderBy]: ['singularname', OrderDirections.ASC],
    }
  )
  const [filterId, setFilterId] = useState<string | null>(null)
  const classes = useStyles()
  const [speciesContainerSettings, setContainerSettings] =
    useStorage<SpeciesContainerSettings>(storageKey, {
      grid: true,
      groupChildren: true,
    })
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

  const filteredSpecies = speciesItems
    ? filterId !== null
      ? findItemAndParents<Species>(speciesItems, filterId)
      : speciesItems
    : null

  const speciesHierarchy: SpeciesWithChildren[] | null = filteredSpecies
    ? speciesContainerSettings?.groupChildren
      ? convertToNestedArray(filteredSpecies)
      : (filteredSpecies as SpeciesWithChildren[])
    : null

  const setSetting = (name: keyof SpeciesContainerSettings, newValue: any) => {
    if (!speciesContainerSettings) {
      return
    }
    setContainerSettings({
      ...speciesContainerSettings,
      [name]: newValue,
    })
  }

  const toggleSetting = (name: keyof SpeciesContainerSettings) => {
    if (!speciesContainerSettings) {
      return
    }
    setSetting(name, !speciesContainerSettings[name])
  }

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
          {speciesContainerSettings?.groupChildren && speciesItem.children
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

  return (
    <>
      {showControls ? (
        <div className={classes.controls}>
          <div className={classes.controlsRight}>
            <div className={classes.controlGroup}>
              <Button
                color="secondary"
                onClick={() => toggleSetting('grid')}
                checked={speciesContainerSettings?.grid}
                size="small">
                Grid
              </Button>
              &nbsp;
              <Button
                color="secondary"
                onClick={() => toggleSetting('groupChildren')}
                checked={speciesContainerSettings?.groupChildren}
                size="small">
                Group Children
              </Button>
              <CreateButton />
            </div>
          </div>
        </div>
      ) : null}
      <div className={classes.autocompleteWrapper}>
        <AutocompleteInput
          label="Filter species"
          options={
            speciesItems
              ? speciesItems.map((speciesItem) => ({
                  label: `${speciesItem.pluralname}${
                    speciesItem.singularname !== speciesItem.pluralname
                      ? `/${speciesItem.singularname}`
                      : ''
                  }${
                    speciesItem.tags.length
                      ? ` (${speciesItem.tags.join(', ')})`
                      : ''
                  }`,
                  data: speciesItem.id,
                }))
              : []
          }
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
            disabled: isLoading,
          }}
        />
      </div>
      {speciesContainerSettings?.grid ? (
        <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}>
          <Masonry>{isLoading ? loadingChildren : children}</Masonry>
        </ResponsiveMasonry>
      ) : (
        <div className={classes.speciesResults}>
          {isLoading ? loadingChildren : children}
        </div>
      )}
    </>
  )
}

export default SpeciesBrowser
