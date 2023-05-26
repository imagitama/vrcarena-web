import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'

import useAssetSearch from '../../hooks/useAssetSearch'

import AssetResults from '../asset-results'
import ErrorMessage from '../error-message'
import LoadingIndicator from '../loading-indicator'
import NoResultsMessage from '../no-results-message'
import TextInput from '../text-input'

const useStyles = makeStyles({
  root: {
    marginTop: '1rem',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '3px',
    padding: '1rem'
  },
  input: { width: '100%' }
})

export default ({ selectedIds, onSelectAssetId, onDeselectAssetId }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, isSearchFailed, hits] = useAssetSearch(searchTerm, {}, 5)
  const classes = useStyles()

  const onClickWithAsset = (event, asset) => {
    event.preventDefault()

    if (selectedIds.includes(asset.id)) {
      onDeselectAssetId(asset.id)
    } else {
      onSelectAssetId(asset.id)
    }
  }

  return (
    <div className={classes.root}>
      <strong>Selected IDs:</strong>
      <br />
      <br />
      <strong>Search for assets:</strong>
      <br />
      <TextInput
        onChange={e => setSearchTerm(e.target.value)}
        className={classes.input}
      />
      <br />
      {isSearching ? (
        <LoadingIndicator message="Searching..." />
      ) : isSearchFailed ? (
        <ErrorMessage>Failed to perform search</ErrorMessage>
      ) : hits && hits.length ? (
        <AssetResults
          assets={hits}
          selectedAssetIds={selectedIds}
          onClickWithEventAndAsset={onClickWithAsset}
        />
      ) : searchTerm ? (
        <NoResultsMessage />
      ) : null}
    </div>
  )
}
