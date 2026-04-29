import React, { SyntheticEvent, useState } from 'react'
import { makeStyles } from '@mui/styles'

import { Asset, PublicAsset } from '@/modules/assets'
import useAssetSearch from '@/hooks/useAssetSearch'

import AssetResults from '@/components/asset-results'
import ErrorMessage from '@/components/error-message'
import LoadingIndicator from '@/components/loading-indicator'
import NoResultsMessage from '@/components/no-results-message'
import TextInput from '@/components/text-input'

const useStyles = makeStyles({
  root: {
    marginTop: '1rem',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '3px',
    padding: '1rem',
  },
  input: { width: '100%' },
})

export default ({
  selectedIds,
  onSelectAssetId,
  onDeselectAssetId,
}: {
  selectedIds: string[]
  onSelectAssetId: (assetId: string) => void
  onDeselectAssetId: (assetId: string) => void
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, lastErrorCode, hits] = useAssetSearch(searchTerm, {}, 5)
  const classes = useStyles()

  const onClickWithAsset = (
    event: SyntheticEvent<HTMLElement, Event>,
    asset: Asset | PublicAsset
  ) => {
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
        onChange={(e) => setSearchTerm(e.target.value)}
        className={classes.input}
      />
      <br />
      {isSearching ? (
        <LoadingIndicator message="Searching..." />
      ) : lastErrorCode !== null ? (
        <ErrorMessage>
          Failed to perform search (code {lastErrorCode})
        </ErrorMessage>
      ) : hits && hits.length ? (
        <AssetResults
          // @ts-ignore create base type for both
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
