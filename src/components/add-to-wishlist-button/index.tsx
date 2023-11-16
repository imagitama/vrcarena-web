import React from 'react'
import CheckIcon from '@material-ui/icons/Check'
import AddToQueueIcon from '@material-ui/icons/AddToQueue'
import RemoveFromQueueIcon from '@material-ui/icons/RemoveFromQueue'

import Button from '../button'

import {
  CollectionNames,
  WishlistFieldNames,
} from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useUserId from '../../hooks/useUserId'

import { handleError } from '../../error-handling'
import useDataStoreItem from '../../hooks/useDataStoreItem'
import { DataStoreError } from '../../data-store'

const getLabel = (
  isLoggedIn: boolean,
  isLoading: boolean,
  isAssetInWishlist: boolean,
  isSaving: boolean,
  lastError: null | DataStoreError,
  isSuccess: boolean
) => {
  if (!isLoggedIn) {
    return 'Log in to add to wishlist'
  }

  if (isLoading) {
    return 'Loading...'
  }

  if (lastError) {
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
  lastError: null | DataStoreError,
  isSuccess: boolean
) => {
  if (!isLoggedIn) {
    return <AddToQueueIcon />
  }

  if (isLoading) {
    return undefined
  }

  if (lastError) {
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

interface WishlistForUser {
  id: string
  assets: string[]
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
  const [isLoadingWishlist, lastErrorLoadingWishlist, myWishlist] =
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

      await saveOrCreate({
        id: userId,
        [WishlistFieldNames.assets]: newAssetIds,
      })
    } catch (err) {
      console.error('Failed to save wishlist', err)
      handleError(err)
    }
  }

  return (
    <Button
      color="default"
      icon={getIcon(
        isLoggedIn,
        isLoadingWishlist,
        isAssetInWishlist,
        isSaving,
        lastSavingError || lastErrorLoadingWishlist,
        isSavingSuccess
      )}
      onClick={onClickBtn}
      isLoading={isAssetLoading}>
      {getLabel(
        isLoggedIn,
        isLoadingWishlist,
        isAssetInWishlist,
        isSaving,
        lastSavingError || lastErrorLoadingWishlist,
        isSavingSuccess
      )}
    </Button>
  )
}
