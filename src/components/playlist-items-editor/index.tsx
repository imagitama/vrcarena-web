import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import CheckIcon from '@material-ui/icons/Check'

import { CollectionNames } from '../../hooks/useDatabaseQuery'
import { Asset, PublicAsset } from '../../modules/assets'
import AssetSearch from '../asset-search'
import Button from '../button'
import FormControls from '../form-controls'
import ItemsEditor, { Item } from '../items-editor'
import AssetResultsItem from '../asset-results-item'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import useDataStoreItem from '../../hooks/useDataStoreItem'
import Paper from '../paper'
import { CollectionItem } from '../../modules/collections'

const useStyles = makeStyles({
  editor: {
    marginBottom: '1rem',
  },
  label: {
    fontSize: '150%',
    marginBottom: '0.5rem',
  },
  formLabel: {
    margin: '0.5rem 0',
  },
})

const AssetEditorForm = ({
  item,
  onDone,
  assetsData: existingAssetsData,
}: {
  onDone: (newItem: CollectionItem) => void
  item?: CollectionItem
  assetsData?: Asset[]
}) => {
  const [newItem, setNewItem] = useState<CollectionItem>(
    item || {
      asset: '',
    }
  )
  const classes = useStyles()
  const [assetsData, setAssetsData] = useState<(Asset | PublicAsset)[]>(
    existingAssetsData || []
  )

  const onSelectedAsset = (newAsset: Asset | PublicAsset) => {
    console.debug(`Selected asset ${newAsset.id} for assetId`)

    setNewItem({
      asset: newAsset.id,
    })
    setAssetsData((currentData) => currentData.concat([newAsset]))
  }

  const setField = (name: keyof CollectionItem, value: any) =>
    setNewItem({ ...newItem, [name]: value })

  const onDoneClick = () => {
    if (!newItem.asset) {
      return
    }
    onDone(newItem)
    setNewItem({
      asset: '',
    })
  }

  return (
    <Paper className={classes.editor}>
      {newItem.asset ? (
        <>
          <AssetResultsItem
            asset={assetsData.find(
              (assetData) => assetData.id === newItem.asset
            )}
          />
          <Button onClick={() => setField('asset', null)} color="default">
            Clear
          </Button>
        </>
      ) : (
        <AssetSearch
          selectedAsset={assetsData.find(
            (assetData) => assetData.id === newItem.asset
          )}
          onSelect={onSelectedAsset}
          limit={10}
        />
      )}
      <FormControls>
        <Button
          onClick={onDoneClick}
          icon={<CheckIcon />}
          isDisabled={!newItem.asset}>
          Add Asset
        </Button>
      </FormControls>
    </Paper>
  )
}

const Renderer = ({ item }: { item: Item<CollectionItem> }) => {
  const [isLoadingAsset, isErrorLoadingAsset, asset] = useDataStoreItem<Asset>(
    CollectionNames.Assets,
    item.asset || false,
    `collection-item`
  )

  if (isLoadingAsset) {
    return <LoadingIndicator message="Loading asset..." />
  }

  if (isErrorLoadingAsset || !asset) {
    return <ErrorMessage>Failed to load asset</ErrorMessage>
  }

  return <AssetResultsItem asset={asset} />
}

const PlaylistItemsEditor = ({
  currentItems = [],
  assetsData = undefined,
  onChange,
}: {
  currentItems?: CollectionItem[]
  assetsData?: PublicAsset[]
  onChange: (newItems: CollectionItem[]) => void
}) => {
  const onNewItems = (items: CollectionItem[]) => onChange(items)
  const onAddAsset = (newItem: CollectionItem) => {
    onChange(currentItems.concat([newItem]))
  }
  return (
    <div>
      <AssetEditorForm onDone={onAddAsset} />
      <ItemsEditor<CollectionItem, { assetsData: PublicAsset[] | undefined }>
        nameSingular="asset"
        // editor={Editor}
        renderer={Renderer}
        items={currentItems}
        onChange={onNewItems}
        emptyItem={{
          asset: '',
        }}
        // onAdd={onAddClick}
        getKey={(item) => item.asset}
        commonProps={{
          assetsData,
        }}
      />
    </div>
  )
}

export default PlaylistItemsEditor
