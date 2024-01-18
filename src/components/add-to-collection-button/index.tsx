import React, { useEffect, useRef, useState } from 'react'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import { makeStyles } from '@material-ui/core/styles'
import CheckIcon from '@material-ui/icons/Check'
import PlaylistAddIcon from '@material-ui/icons/PlaylistAdd'
import PlaylistAddCheckIcon from '@material-ui/icons/PlaylistAddCheck'

import { DataStoreError } from '../../data-store'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useMyCollections from '../../hooks/useMyCollections'
import CreateCollectionForm from '../create-collection-form'
import { handleError } from '../../error-handling'
import useUserId from '../../hooks/useUserId'
import useDataStoreItem from '../../hooks/useDataStoreItem'
import useIsLoggedIn from '../../hooks/useIsLoggedIn'
import Button from '../button'
import {
  CollectionNames,
  CollectionForUser,
  Collection,
  CollectionItem,
} from '../../modules/collections'

const useStyles = makeStyles({
  createForm: {
    padding: '5px',
  },
  divider: {
    width: '100%',
    height: '1px',
    background: 'rgba(255, 255, 255, 0.5)',
  },
})

const MenuItemWithIcon = ({
  icon,
  children,
  onClick,
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
  onDone,
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

  const [isSaving, isSavingSuccess, lastSavingError, saveCollection] =
    useDatabaseSave<Collection>(CollectionNames.Collections, collectionId)

  const isAssetInCollection =
    items.find((item) => item.asset === assetId) !== undefined

  const onClick = async () => {
    try {
      const existingItems = items

      const newItems: CollectionItem[] = isAssetInCollection
        ? existingItems.filter((item) => item.asset !== assetId)
        : [
            ...existingItems,
            {
              asset: assetId,
            },
          ]

      await saveCollection({
        items: newItems,
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
        lastSavingError,
        isSavingSuccess
      )}
      onClick={onClick}>
      {getLabel(
        title,
        false,
        isAssetInCollection,
        isSaving,
        lastSavingError,
        isSavingSuccess
      )}
    </MenuItemWithIcon>
  )
}

const getIcon = (
  isLoading: boolean,
  isAssetInCollection: boolean,
  isSaving: boolean,
  lastSavingError: null | DataStoreError,
  isSuccess: boolean
) => {
  if (isLoading) {
    return undefined
  }

  if (lastSavingError) {
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
  lastSavingError: null | DataStoreError,
  isSuccess: boolean
) => {
  if (isLoading) {
    return 'Loading...'
  }

  if (lastSavingError) {
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
  onDone,
}: {
  assetId: string
  onDone: (newValue: boolean) => void
}) => {
  const userId = useUserId()
  const [isLoadingCollection, lastErrorLoadingCollection, myCollection] =
    useDataStoreItem<CollectionForUser>(
      CollectionNames.CollectionsForUsers,
      userId || false
    )
  const [isSaving, isSavingSuccess, lastSavingError, saveOrCreate] =
    useDatabaseSave<CollectionForUser>(
      CollectionNames.CollectionsForUsers,
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
        ? currentAssetIds.filter((itemId) => itemId !== assetId)
        : currentAssetIds.concat([assetId])

      await saveOrCreate({
        assets: newAssetIds,
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
        lastSavingError || lastErrorLoadingCollection,
        isSavingSuccess
      )}
      onClick={onClickBtn}>
      {getLabel(
        'Owned Assets',
        isLoadingCollection,
        isAssetInCollection,
        isSaving,
        lastSavingError || lastErrorLoadingCollection,
        isSavingSuccess
      )}
    </MenuItemWithIcon>
  )
}

const Divider = () => {
  const classes = useStyles()
  return <div className={classes.divider} />
}

export default ({
  assetId,
  isAssetLoading,
  onClick,
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
  const [isLoading, lastSavingError, myCollections, , hydrate] =
    useMyCollections()
  const rootRef = useRef<HTMLDivElement>(null)
  const classes = useStyles()
  const timerRef = useRef()
  const isLoggedIn = useIsLoggedIn()

  const onClickMainButton = () => {
    if (!isLoggedIn) {
      return
    }

    setIsMenuOpen((currentVal) => {
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
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
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
              ) : lastSavingError ? (
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
