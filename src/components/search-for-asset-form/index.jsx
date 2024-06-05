import React, { useCallback, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'

import useSearching from '../../hooks/useSearching'
import TextInput from '../text-input'
import CheckboxInput from '../checkbox-input'
import AssetResults from '../asset-results'
import { AssetFieldNames, CollectionNames } from '../../hooks/useDatabaseQuery'
import categoryMeta, { getCategoryMeta } from '../../category-meta'
import { AssetCategory } from '../../modules/assets'

const useStyles = makeStyles({
  textInput: {
    width: '100%',
  },
  row: {
    marginTop: '1rem',
  },
  assets: {
    marginTop: '1rem',
    display: 'flex',
    flexWrap: 'wrap',
  },
  button: {
    margin: '0 0.5rem 0.5rem 0',
  },
  categories: {
    display: 'flex',
  },
  category: {
    margin: '0 0.25rem 0.25rem 0',
  },
})

function SearchForm({
  selectedCategoryNames,
  searchTerm,
  onSelectIdWithDetails,
  filterResults = null,
}) {
  const getQuery = useCallback(
    (query) => query.in(AssetFieldNames.category, selectedCategoryNames),
    [selectedCategoryNames.join(',')]
  )
  const [isSearching, isErrored, results] = useSearching(
    CollectionNames.Assets,
    searchTerm,
    '*',
    [AssetFieldNames.title],
    getQuery
  )

  if (isSearching) {
    return 'Searching...'
  }

  if (isErrored) {
    return 'Errored'
  }

  if (!results) {
    return null
  }

  const filteredResults = filterResults ? filterResults(results) : results

  if (!filteredResults.length) {
    return 'No results!'
  }

  return (
    <>
      Select a result:
      <AssetResults
        assets={filteredResults}
        onClickWithEventAndAsset={(e, asset) => {
          e.preventDefault()
          onSelectIdWithDetails(asset.id, asset)
          return false
        }}
      />
    </>
  )
}

export default ({
  onSelectIdWithDetails,
  category = null,
  filterResults = null,
}) => {
  const [searchTerm, setSearchTerm] = useState(null)
  const [selectedCategoryNames, setSelectedCategoryNames] = useState([
    category ? category : AssetCategory.Avatar,
  ])
  const classes = useStyles()

  const onSelectIdWithDetailsAndClear = (id, details) => {
    setSearchTerm('')
    onSelectIdWithDetails(id, details)
  }

  return (
    <>
      {category ? null : (
        <div className={classes.categories}>
          {Object.values(AssetCategory).map((categoryName) => (
            <div key={categoryName} className={classes.category}>
              <CheckboxInput
                value={selectedCategoryNames.includes(categoryName)}
                label={getCategoryMeta(categoryName).name}
                onChange={(newVal) =>
                  setSelectedCategoryNames((currentNames) =>
                    newVal
                      ? currentNames.concat([categoryName])
                      : currentNames.filter((name) => name !== categoryName)
                  )
                }
              />
            </div>
          ))}
        </div>
      )}

      <div className={classes.row}>
        {searchTerm && (
          <>
            <SearchForm
              selectedCategoryNames={selectedCategoryNames}
              searchTerm={searchTerm}
              category={category}
              onSelectIdWithDetails={onSelectIdWithDetailsAndClear}
              filterResults={filterResults}
            />
          </>
        )}
      </div>

      <div className={classes.row}>
        Search:
        <TextInput
          onChange={(e) => setSearchTerm(e.target.value)}
          value={searchTerm}
          variant="filled"
          className={classes.textInput}
        />
      </div>
    </>
  )
}
