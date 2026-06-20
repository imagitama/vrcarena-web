import React from 'react'
import CheckIcon from '@mui/icons-material/Check'
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd'
import AddToQueueIcon from '@mui/icons-material/AddToQueue'
import RemoveFromQueueIcon from '@mui/icons-material/RemoveFromQueue'

import useDataStoreEdit from '@/hooks/useDataStoreEdit'
import useUserId from '@/hooks/useUserId'
import { handleError } from '@/error-handling'
import useDataStoreItem from '@/hooks/useDataStoreItem'
import { DataStoreErrorCode } from '@/data-store'

import Button from '@/components/button'
import { CollectionNames, CollectionForUser } from '@/modules/collections'
import useDataStoreCreate from '@/hooks/useDataStoreCreate'
import useIsLoggedIn from '@/hooks/useIsLoggedIn'
import useTimer from '@/hooks/useTimer'

const getLabel = (
  isLoggedIn: boolean,
  isLoading: boolean,
  isAssetInOwnedAssets: boolean,
  isSaving: boolean,
  lastErrorCode: null | DataStoreErrorCode,
  isSuccess: boolean
) => {
  if (!isLoggedIn) {
    return 'Log in to add to Owned Assets'
  }

  if (isLoading) {
    return 'Loading...'
  }

  if (lastErrorCode) {
    return 'Error!'
  }

  if (isSaving) {
    if (isAssetInOwnedAssets) {
      return 'Removing from Owned Assets...'
    } else {
      return 'Adding to Owned Assets...'
    }
  }

  if (isSuccess) {
    if (!isAssetInOwnedAssets) {
      return 'Removed from Owned Assets'
    } else {
      return 'Added to Owned Assets'
    }
  }

  if (isAssetInOwnedAssets) {
    return 'Remove from Owned Assets'
  }

  return 'Add to Owned Assets'
}

const getIcon = (
  isLoggedIn: boolean,
  isLoading: boolean,
  isAssetInOwnedAssets: boolean,
  isSaving: boolean,
  lastErrorCode: null | DataStoreErrorCode,
  isSuccess: boolean
) => {
  if (!isLoggedIn) {
    return <PlaylistAddIcon />
  }

  if (isLoading) {
    return undefined
  }

  if (lastErrorCode) {
    return undefined
  }

  if (isSaving) {
    if (isAssetInOwnedAssets) {
      return undefined
    } else {
      return undefined
    }
  }

  if (isSuccess) {
    return <CheckIcon />
  }

  if (isAssetInOwnedAssets) {
    return <RemoveFromQueueIcon />
  }

  return <PlaylistAddIcon />
}

const AddToMyCollectionButton = ({
  assetId,
  onClick,
  isAssetLoading,
  onDone,
}: {
  assetId: string
  isAssetLoading: boolean
  onClick?: (data: { newValue: boolean }) => void
  onDone: () => void
}) => {
  const isLoggedIn = useIsLoggedIn()
  const userId = useUserId()!
  const [
    isLoadingMyCollection,
    lastErrorCodeLoadingMyCollection,
    collectionForUser,
    hydrate,
  ] = useDataStoreItem<CollectionForUser>(
    CollectionNames.CollectionsForUsers,
    userId
  )
  const [isEditing, isSavingSuccess, lastSavingErrorCode, save, clearEdit] =
    useDataStoreEdit<CollectionForUser>(
      CollectionNames.CollectionsForUsers,
      collectionForUser ? userId : false,
      { queryName: 'save-collection-for-user' }
    )
  const [
    isCreating,
    isCreatingSuccess,
    lastCreatingErrorCode,
    create,
    clearCreate,
  ] = useDataStoreCreate<CollectionForUser>(
    CollectionNames.CollectionsForUsers,
    {
      queryName: 'create-collection-for-user',
    }
  )
  const isSuccess = isSavingSuccess || isCreatingSuccess
  const isSaving = isEditing || isCreating
  const clearAfterDelay = useTimer(() => {
    clearEdit()
    clearCreate()
  })

  const isAssetInMyCollection = collectionForUser
    ? collectionForUser.assets.includes(assetId)
    : false
  const assetIdsInMyCollection = collectionForUser
    ? collectionForUser.assets
    : []

  const onClickBtn = async () => {
    try {
      const newAssetIds = isAssetInMyCollection
        ? assetIdsInMyCollection.filter((itemId) => itemId !== assetId)
        : assetIdsInMyCollection.concat([assetId])

      if (collectionForUser) {
        await save({
          assets: newAssetIds,
        })
      } else {
        await create({
          id: userId,
          assets: newAssetIds,
        })
      }

      onDone()

      hydrate()

      clearAfterDelay()
    } catch (err) {
      console.error('Failed to save collection for user', err)
      handleError(err)
    }
  }

  return (
    <Button
      color="secondary"
      hollow={false}
      icon={getIcon(
        isLoggedIn,
        isLoadingMyCollection,
        isAssetInMyCollection,
        isSaving,
        lastSavingErrorCode ||
          lastCreatingErrorCode ||
          lastErrorCodeLoadingMyCollection,
        isSuccess
      )}
      onClick={onClickBtn}
      isLoading={isAssetLoading}>
      {getLabel(
        isLoggedIn,
        isLoadingMyCollection,
        isAssetInMyCollection,
        isSaving,
        lastSavingErrorCode ||
          lastCreatingErrorCode ||
          lastErrorCodeLoadingMyCollection,
        isSuccess
      )}
    </Button>
  )
}

export default AddToMyCollectionButton
