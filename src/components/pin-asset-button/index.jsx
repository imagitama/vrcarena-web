import React from 'react'
import RoomIcon from '@material-ui/icons/Room'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import useUserId from '../../hooks/useUserId'
import {
  CollectionNames,
  AssetFieldNames,
  options
} from '../../hooks/useDatabaseQuery'

import { handleError } from '../../error-handling'

import Button from '../button'
import useDataStoreItem from '../../hooks/useDataStoreItem'

export default ({ assetId, isAlreadyPinned = undefined, onClick = null }) => {
  // TODO: Check if they are editor! We are assuming the parent does this = not good

  const userId = useUserId()

  const [isLoadingAsset, isErroredLoadingAsset, asset] = useDataStoreItem(
    CollectionNames.Assets,
    isAlreadyPinned !== undefined ? false : assetId,
    'pin-asset-btn'
  )
  const [isSaving, , isSaveErrored, save] = useDatabaseSave(
    CollectionNames.Assets,
    assetId
  )

  const isPinned = asset ? asset[AssetFieldNames.isPinned] : isAlreadyPinned

  if (isLoadingAsset || isSaving) {
    // TODO: Remove string duplication with color prop
    return <Button color="default">Loading...</Button>
  }

  if (isErroredLoadingAsset || isSaveErrored) {
    return <Button disabled>Error</Button>
  }

  const onBtnClick = async () => {
    try {
      const newValue = !isPinned

      if (onClick) {
        onClick(newValue)
      }

      await save({
        [AssetFieldNames.isPinned]: newValue
      })
    } catch (err) {
      console.error('Failed to pin or unpin asset', err)
      handleError(err)
    }
  }

  return (
    <Button color="default" onClick={onBtnClick} icon={<RoomIcon />}>
      {isPinned ? 'Unpin' : 'Pin'}
    </Button>
  )
}
