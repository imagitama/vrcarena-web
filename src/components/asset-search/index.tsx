import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import MenuItem from '@material-ui/core/MenuItem'

import useAssetSearch from '../../hooks/useAssetSearch'
import { Asset } from '../../modules/assets'
import categoryMeta from '../../category-meta'
import { AssetCategories, AssetFieldNames } from '../../hooks/useDatabaseQuery'
import AssetResults from '../asset-results'
import ErrorMessage from '../error-message'
import LoadingIndicator from '../loading-indicator'
import TextInput from '../text-input'
import Select from '../select'

const useStyles = makeStyles({
  dropdown: {
    width: '30%',
  },
  textInput: {
    width: '70%',
  },
})

export default ({
  onSelect,
  selectedAsset = undefined,
  limit = 5,
}: {
  onSelect: (asset: Asset) => void
  selectedAsset?: Asset
  limit?: number
}) => {
  const [userInput, setUserInput] = useState('')
  // preselect avatars as it is the most common kind of search
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    AssetCategories.avatar
  )
  const [isSearching, isError, results] = useAssetSearch(
    userInput,
    selectedCategory ? { [AssetFieldNames.category]: [selectedCategory] } : {},
    limit
  )
  const classes = useStyles()

  return (
    <>
      {isSearching ? (
        <LoadingIndicator message="Searching..." />
      ) : isError ? (
        <ErrorMessage>Failed to search</ErrorMessage>
      ) : null}
      {results || selectedAsset ? (
        <AssetResults
          assets={
            results ? results : selectedAsset ? [selectedAsset] : undefined
          }
          onClickWithEventAndAsset={(event, asset) => {
            event.preventDefault()
            event.stopPropagation()
            onSelect(asset)
            return false
          }}
          dimUnselected
          showSelectedTick
          selectedAssetIds={selectedAsset ? [selectedAsset.id] : undefined}
        />
      ) : null}

      <div>
        <Select
          onChange={(e) =>
            setSelectedCategory((e.target.value as string) || null)
          }
          className={classes.dropdown}
          value={selectedCategory || 'all'}>
          <MenuItem value="all" selected={selectedCategory === null}>
            All Categories
          </MenuItem>
          {Object.entries(categoryMeta).map(([categoryName, categoryInfo]) => (
            <MenuItem
              value={categoryName}
              selected={categoryName === selectedCategory}>
              {categoryInfo.nameSingular}
            </MenuItem>
          ))}
        </Select>
        <TextInput
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Search for an asset"
          className={classes.textInput}
        />
      </div>
    </>
  )
}
