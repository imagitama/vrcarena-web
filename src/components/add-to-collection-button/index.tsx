import React, { useEffect, useRef, useState } from 'react'
import Menu from '@material-ui/core/Menu'
import MenuItem, { MenuItemProps } from '@material-ui/core/MenuItem'
import { makeStyles } from '@material-ui/core/styles'
import CheckIcon from '@material-ui/icons/Check'
import PlaylistAddIcon from '@material-ui/icons/PlaylistAdd'
import PlaylistAddCheckIcon from '@material-ui/icons/PlaylistAddCheck'

import {
  CollectionNames,
  PlaylistItemsFieldNames,
  PlaylistsFieldNames
} from '../../data-store'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useMyCollections from '../../hooks/useMyCollections'
import CreateCollectionForm from '../create-collection-form'
import Button from '../button'
import { handleError } from '../../error-handling'
import useDatabaseQuery, {
  CollectionFieldNames,
  options,
  CollectionNames as OldCollectionNames
} from '../../hooks/useDatabaseQuery'
import useUserId from '../../hooks/useUserId'
import useDataStoreItem from '../../hooks/useDataStoreItem'
import useIsLoggedIn from '../../hooks/useIsLoggedIn'

const useStyles = makeStyles({
  createForm: {
    padding: '5px'
  },
  divider: {
    width: '100%',
    height: '1px',
    background: 'rgba(255, 255, 255, 0.5)'
  }
})

const MenuItemWithIcon = ({
  icon,
  children,
  onClick
}: {
  icon: React.ReactNode
  children: React.ReactNode
  onClick: () => void
}) => (
  <MenuItem onClick={onClick}>
    {icon} &nbsp; {children}
  </MenuItem>
)

const CollectionMenuItem = ({
  assetId,
  collection: { id: collectionId, items, title },
  onDone
}: {
  assetId: string
  collection: Collection
  onDone: (newValue: boolean) => void
}) => {
  if (!collectionId) {
    throw new Error('Need an id')
  }

  if (!items) {
    items = []
  }

  const [
    isSaving,
    isSavingSuccess,
    isSavingError,
    saveCollection
  ] = useDatabaseSave(CollectionNames.Playlists, collectionId)

  const isAssetInCollection =
    items.find(item => item.asset === assetId) !== undefined

  const onClick = async () => {
    try {
      const existingItems = items

      const newItems = isAssetInCollection
        ? existingItems.filter(item => item.asset !== assetId)
        : [
            ...existingItems,
            {
              [PlaylistItemsFieldNames.asset]: assetId,
              [PlaylistItemsFieldNames.comments]: '' // TODO: Allow them to set this?
            }
          ]

      await saveCollection({
        [PlaylistsFieldNames.items]: newItems
      })

      onDone(!isAssetInCollection)
    } catch (err) {
      handleError(err)
    }
  }

  return (
    <MenuItemWithIcon
      icon={getIcon(
        false,
        isAssetInCollection,
        isSaving,
        isSavingError,
        isSavingSuccess
      )}
      onClick={onClick}>
      {getLabel(
        title,
        false,
        isAssetInCollection,
        isSaving,
        isSavingError,
        isSavingSuccess
      )}
    </MenuItemWithIcon>
  )
}

const getIcon = (
  isLoading: boolean,
  isAssetInCollection: boolean,
  isSaving: boolean,
  isErrored: boolean,
  isSuccess: boolean
) => {
  if (isLoading) {
    return undefined
  }

  if (isErrored) {
    return undefined
  }

  if (isSaving) {
    if (isAssetInCollection) {
      return undefined
    } else {
      return undefined
    }
  }

  if (isSuccess) {
    return <CheckIcon />
  }

  if (isAssetInCollection) {
    return <PlaylistAddCheckIcon />
  }

  return <PlaylistAddIcon />
}

const getLabel = (
  title: string,
  isLoading: boolean,
  isAssetInCollection: boolean,
  isSaving: boolean,
  isErrored: boolean,
  isSuccess: boolean
) => {
  if (isLoading) {
    return 'Loading...'
  }

  if (isErrored) {
    return 'Error!'
  }

  if (isSaving) {
    if (isAssetInCollection) {
      return 'Removing...'
    } else {
      return 'Adding...'
    }
  }

  if (isSuccess) {
    if (isAssetInCollection) {
      return 'Removed!'
    } else {
      return 'Added!'
    }
  }

  return title
}

const MyCollectionMenuItem = ({
  assetId,
  onDone
}: {
  assetId: string
  onDone: (newValue: boolean) => void
}) => {
  const userId = useUserId()
  const [
    isLoadingCollection,
    isErrorLoadingCollection,
    myCollection
  ] = useDataStoreItem<CollectionForUser>(
    OldCollectionNames.CollectionsForUsers,
    userId || false
  )
  const [
    isSaving,
    isSavingSuccess,
    isSavingError,
    saveOrCreate
  ] = useDatabaseSave(
    OldCollectionNames.CollectionsForUsers,
    myCollection ? userId : null
  )
  const isLoggedIn = !!userId
  const isAssetInCollection = !!(
    myCollection &&
    myCollection.assets &&
    myCollection.assets.includes(assetId)
  )
  const currentAssetIds: string[] =
    myCollection && myCollection.assets ? myCollection.assets : []

  const onClickBtn = async () => {
    try {
      if (!isLoggedIn) {
        return
      }

      const newAssetIds = isAssetInCollection
        ? currentAssetIds.filter(itemId => itemId !== assetId)
        : currentAssetIds.concat([assetId])

      await saveOrCreate({
        [CollectionFieldNames.assets]: newAssetIds
      })

      onDone(!isAssetInCollection)
    } catch (err) {
      console.error('Failed to save collection', err)
      handleError(err)
    }
  }

  return (
    <MenuItemWithIcon
      icon={getIcon(
        isLoadingCollection,
        isAssetInCollection,
        isSaving,
        isSavingError || isErrorLoadingCollection,
        isSavingSuccess
      )}
      onClick={onClickBtn}>
      {getLabel(
        'Owned Assets',
        isLoadingCollection,
        isAssetInCollection,
        isSaving,
        isSavingError || isErrorLoadingCollection,
        isSavingSuccess
      )}
    </MenuItemWithIcon>
  )
}

const Divider = () => {
  const classes = useStyles()
  return <div className={classes.divider} />
}

interface CollectionForUser {
  id: string
  assets: string[]
}

interface CollectionItem {
  asset: string
}

interface Collection {
  id: string
  items: CollectionItem[]
  title: string
}

export default ({
  assetId,
  isAssetLoading,
  onClick
}: {
  assetId: string
  isAssetLoading: boolean
  onClick?: (data: { newValue: boolean }) => void
}) => {
  if (!assetId) {
    throw new Error('Need asset id')
  }

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCreateFormVisible, setIsCreateFormVisible] = useState(false)
  const [isLoading, isErrored, myCollections, , hydrate] = useMyCollections()
  const rootRef = useRef<HTMLDivElement>(null)
  const classes = useStyles()
  const timerRef = useRef()
  const isLoggedIn = useIsLoggedIn()

  const onClickMainButton = () => {
    if (!isLoggedIn) {
      return
    }

    setIsMenuOpen(currentVal => {
      if (!currentVal) {
        hydrate()
      }
      return !currentVal
    })
  }

  const onClickCreateCollection = () => setIsCreateFormVisible(true)

  const onCreateDone = () => {
    setIsCreateFormVisible(false)
    hydrate()
  }

  const onCreateCancel = () => {
    setIsCreateFormVisible(false)
  }

  const onAddOrRemoveDone = (newValue: boolean) => {
    if (onClick) {
      onClick({ newValue })
    }
  }

  useEffect(() => {
    return () => clearTimeout(timerRef.current)
  }, [])

  return (
    <div ref={rootRef}>
      <Button
        icon={<PlaylistAddIcon />}
        onClick={onClickMainButton}
        color="default"
        isLoading={isAssetLoading}>
        {isLoggedIn ? 'Add To Collection...' : 'Log in to add to collection'}
      </Button>
      <Menu
        anchorEl={rootRef.current}
        getContentAnchorEl={null}
        open={isMenuOpen}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
        onClose={() => setIsMenuOpen(false)}>
        <div>
          {isMenuOpen ? (
            <>
              <MyCollectionMenuItem
                assetId={assetId}
                onDone={onAddOrRemoveDone}
              />
              <Divider />
              {isLoading ? (
                <MenuItem>Loading...</MenuItem>
              ) : isErrored ? (
                <MenuItem>Failed to load</MenuItem>
              ) : null}
              {myCollections ? (
                myCollections.length > 0 ? (
                  myCollections.map((collection: Collection) => (
                    <CollectionMenuItem
                      key={collection.id}
                      assetId={assetId}
                      collection={collection}
                      onDone={onAddOrRemoveDone}
                    />
                  ))
                ) : (
                  <MenuItem>No collections</MenuItem>
                )
              ) : (
                <MenuItem>...</MenuItem>
              )}
              <Divider />
              {isCreateFormVisible === false ? (
                <MenuItem onClick={onClickCreateCollection}>
                  <>Create collection...</>
                </MenuItem>
              ) : (
                <div className={classes.createForm}>
                  <CreateCollectionForm
                    onDone={onCreateDone}
                    onCancel={onCreateCancel}
                  />
                </div>
              )}
            </>
          ) : null}
        </div>
      </Menu>
    </div>
  )
}
