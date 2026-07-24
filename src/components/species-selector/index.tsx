import React, { useState } from 'react'
import { RichTreeView } from '@mui/x-tree-view/RichTreeView'
import { TreeItem } from '@mui/x-tree-view/TreeItem'
import styled from '@emotion/styled'

import { PublicSpeciesForCache } from '@/modules/species'
import { findItemAndParents } from '@/utils'

import ErrorMessage from '@/components/error-message'
import LoadingIndicator from '@/components/loading-indicator'
import AutocompleteInput from '@/components/autocomplete-input'
import NoResultsMessage from '../no-results-message'
import { TreeItemProps } from '@mui/x-tree-view'
import useSpecies from '@/hooks/useSpecies'
import { VRCArenaTheme } from '@/themes'

interface TreeItem {
  id: string
  label: string
  children: TreeItem[]
}
interface SpeciesTreeItem extends TreeItem {
  children: SpeciesTreeItem[]
  species: PublicSpeciesForCache
}

const convertToNestedArray = (
  arr: PublicSpeciesForCache[],
  parentId: string | null = null
): SpeciesTreeItem[] => {
  const nestedArray: SpeciesTreeItem[] = []
  for (const item of arr) {
    if (item.parent === parentId) {
      const treeItem: SpeciesTreeItem = {
        id: item.id,
        label: item.singularname,
        children: convertToNestedArray(arr, item.id),
        species: item,
      }
      nestedArray.push(treeItem)
    }
  }
  return nestedArray
}

const TreeItemRoot = styled.div`
  & svg {
    font-size: 200%;
  }
`

const TreeItemLabel = styled.div`
  display: flex;
  align-items: center;
  font-size: 100%;
`

const SpeciesThumb = styled.img`
  border-radius: ${({ theme }: { theme?: VRCArenaTheme }) =>
    `${theme!.shape.borderRadius}px`};
  width: 2rem;
  height: 2rem;
  margin-right: 0.5rem;
`

const CustomTreeItem = (props: TreeItemProps) => {
  const [, , species] = useSpecies()
  const speciesItem = species!.find((item) => item.id === props.itemId)!
  return (
    <TreeItem
      {...props}
      slots={{
        root: (props) => <TreeItemRoot {...props} />,
        label: (props) => (
          <TreeItemLabel>
            <SpeciesThumb src={speciesItem.thumbnailurl} />
            {props.children}
          </TreeItemLabel>
        ),
      }}
    />
  )
}

const findSelectedTreeItems = (
  items: SpeciesTreeItem[],
  selectedIds: string[]
): SpeciesTreeItem[] => {
  const selectedSet = new Set(selectedIds)
  const result: SpeciesTreeItem[] = []

  const walk = (nodes: SpeciesTreeItem[]) => {
    for (const node of nodes) {
      if (selectedSet.has(node.id)) {
        result.push(node)
      }
      if (node.children?.length) {
        walk(node.children)
      }
    }
  }

  walk(items)
  return result
}

const renderTreeItemChildren = (children: TreeItem[]) => {
  if (!children.length) return null

  return (
    <span>
      {' '}
      (
      {children.map((child, i) => (
        <span key={child.id}>
          {i > 0 ? ', ' : ''}
          {child.label}
          {renderTreeItemChildren(child.children)}
        </span>
      ))}
      )
    </span>
  )
}

const SpeciesSelector = ({
  selectedSpeciesIds,
  onSelectedSpeciesIds,
}: {
  selectedSpeciesIds: string[]
  onSelectedSpeciesIds: (ids: string[]) => void
}) => {
  const [isLoading, lastErrorCode, allSpecies] = useSpecies()
  const [filterId, setFilterId] = useState<string | null>(null)

  if (isLoading || !allSpecies) {
    return <LoadingIndicator message="Loading species..." />
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>Failed to load species (code {lastErrorCode})</ErrorMessage>
    )
  }

  const filteredSpecies =
    filterId !== null
      ? findItemAndParents<PublicSpeciesForCache>(allSpecies, [filterId])
      : allSpecies

  const speciesTreeItems: SpeciesTreeItem[] =
    convertToNestedArray(filteredSpecies)

  const selectedTreeItems: SpeciesTreeItem[] = findSelectedTreeItems(
    convertToNestedArray(allSpecies),
    selectedSpeciesIds
  )

  return (
    <>
      {selectedSpeciesIds.length ? (
        <div style={{ margin: '1rem 0' }}>
          <strong>Selected: </strong>
          {selectedTreeItems.map((treeItem, i) => {
            return (
              <span key={treeItem.id}>
                {i > 0 ? ', ' : ''}
                {treeItem.label}
                {renderTreeItemChildren(treeItem.children)}
              </span>
            )
          })}
        </div>
      ) : (
        <NoResultsMessage>No species selected yet</NoResultsMessage>
      )}
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
          size: 'small',
        }}
      />
      <RichTreeView
        items={speciesTreeItems}
        multiSelect
        checkboxSelection
        selectedItems={selectedSpeciesIds}
        onSelectedItemsChange={(event, ids) => {
          onSelectedSpeciesIds(ids)
        }}
        slots={{
          item: (props) => <CustomTreeItem {...props} />,
        }}
      />
    </>
  )
}

export default SpeciesSelector
