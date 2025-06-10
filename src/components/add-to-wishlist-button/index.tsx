import React from 'react'
import CheckIcon from '@mui/icons-material/Check'
import AddToQueueIcon from '@mui/icons-material/AddToQueue'
import RemoveFromQueueIcon from '@mui/icons-material/RemoveFromQueue'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import useUserId from '../../hooks/useUserId'
import { handleError } from '../../error-handling'
import useDataStoreItem from '../../hooks/useDataStoreItem'
import { DataStoreErrorCode } from '../../data-store'

import Button from '../button'
import { CollectionNames, WishlistForUser } from '../../modules/wishlists'

const getLabel = (
  isLoggedIn: boolean,
  isLoading: boolean,
  isAssetInWishlist: boolean,
  isSaving: boolean,
  lastErrorCode: null | DataStoreErrorCode,
  isSuccess: boolean
) => {
  if (!isLoggedIn) {
    return 'Log in to add to wishlist'
  }

  if (isLoading) {
    return 'Loading...'
  }

  if (lastErrorCode) {
    return 'Error!'
  }

  if (isSaving) {
    if (isAssetInWishlist) {
      return 'Removing from your wishlist...'
    } else {
      return 'Adding to your wishlist...'
    }
  }

  if (isSuccess) {
    if (isAssetInWishlist) {
      return 'Removed from your wishlist!'
    } else {
      return 'Added to your wishlist!'
    }
  }

  if (isAssetInWishlist) {
    return 'Remove from Wishlist'
  }

  return 'Add to Wishlist'
}

const getIcon = (
  isLoggedIn: boolean,
  isLoading: boolean,
  isAssetInWishlist: boolean,
  isSaving: boolean,
  lastErrorCode: null | DataStoreErrorCode,
  isSuccess: boolean
) => {
  if (!isLoggedIn) {
    return <AddToQueueIcon />
  }

  if (isLoading) {
    return undefined
  }

  if (lastErrorCode) {
    return undefined
  }

  if (isSaving) {
    if (isAssetInWishlist) {
      return undefined
    } else {
      return undefined
    }
  }

  if (isSuccess) {
    return <CheckIcon />
  }

  if (isAssetInWishlist) {
    return <RemoveFromQueueIcon />
  }

  return <AddToQueueIcon />
}

export default ({
  assetId,
  onClick,
  isAssetLoading,
}: {
  assetId: string
  isAssetLoading: boolean
  onClick?: (data: { newValue: boolean }) => void
}) => {
  const userId = useUserId()
  const [isLoadingWishlist, lastErrorCodeLoadingWishlist, myWishlist] =
    useDataStoreItem<WishlistForUser>(
      CollectionNames.WishlistsForUsers,
      userId || false,
      'add-to-wishlist-button'
    )
  const [isSaving, isSavingSuccess, lastSavingError, saveOrCreate] =
    useDatabaseSave(
      CollectionNames.WishlistsForUsers,
      myWishlist ? userId : null
    )
  const isLoggedIn = !!userId
  const isAssetInWishlist =
    myWishlist && myWishlist.assets && myWishlist.assets.includes(assetId)
      ? true
      : false
  const currentAssetIds =
    myWishlist && myWishlist.assets ? myWishlist.assets : []

  const onClickBtn = async () => {
    try {
      if (!isLoggedIn) {
        return
      }

      const newAssetIds = isAssetInWishlist
        ? currentAssetIds.filter((itemId) => itemId !== assetId)
        : currentAssetIds.concat([assetId])

      if (onClick) {
        onClick({ newValue: isAssetInWishlist })
      }

      const record: WishlistForUser = {
        id: userId,
        assets: newAssetIds,
      }

      await saveOrCreate(record)
    } catch (err) {
      console.error('Failed to save wishlist', err)
      handleError(err)
    }
  }

  return (
    <Button
      color="secondary"
      icon={getIcon(
        isLoggedIn,
        isLoadingWishlist,
        isAssetInWishlist,
        isSaving,
        lastSavingError || lastErrorCodeLoadingWishlist,
        isSavingSuccess
      )}
      onClick={onClickBtn}
      isLoading={isAssetLoading}>
      {getLabel(
        isLoggedIn,
        isLoadingWishlist,
        isAssetInWishlist,
        isSaving,
        lastSavingError || lastErrorCodeLoadingWishlist,
        isSavingSuccess
      )}
    </Button>
  )
}
