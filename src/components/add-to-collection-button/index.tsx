import React, { useEffect, useRef, useState } from 'react'
import { makeStyles } from '@mui/styles'
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import MenuItem from '@mui/material/MenuItem'

import {
  CollectionNames,
  CollectionForUser,
  Collection,
  CollectionItem,
} from '../../modules/collections'
import useDataStoreEdit from '../../hooks/useDataStoreEdit'
import useMyCollections from '../../hooks/useMyCollections'
import { handleError } from '../../error-handling'
import useUserId from '../../hooks/useUserId'
import useDataStoreItem from '../../hooks/useDataStoreItem'
import useIsLoggedIn from '../../hooks/useIsLoggedIn'

import CreateCollectionForm from '../create-collection-form'
import Button from '../button'
import Dialog from '../dialog'
import Heading from '../heading'
import ErrorMessage from '../error-message'
import Tooltip from '../tooltip'
import ErrorBoundary from '../error-boundary'
import useTimer from '../../hooks/useTimer'
import LoadingShimmer from '../loading-shimmer'
import { getRandomInt } from '../../utils'
import StatusText from '../status-text'
import { getFriendlyDate } from '../../utils/dates'
import { mediaQueryForTabletsOrBelow } from '../../media-queries'
import useDataStoreCreate from '../../hooks/useDataStoreCreate'
import NoResultsMessage from '../no-results-message'
import { routes } from '../../routes'

const useStyles = makeStyles({
  root: {
    '& h2': {
      marginBottom: '0.5rem !important',
    },
  },
  items: {
    marginTop: '0.5rem',
    width: '550px', // 600px
    maxHeight: 'calc(36px * 8)',
    overflowY: 'auto',
    overflowX: 'hidden',
    [mediaQueryForTabletsOrBelow]: {
      width: '100%',
    },
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    '& > :first-child': {
      width: '100%',
      '& > span': {
        marginLeft: '0.5rem',
      },
    },
    '& > :last-child': {
      display: 'flex',
      alignItems: 'center',
    },
  },
})

const ListItem = ({
  assetId,
  collection,
  onClick,
  savedMessage,
  isSaving,
}: {
  assetId: string
  collection: Collection
  onClick: () => void
  savedMessage?: string
  isSaving: boolean
}) => {
  const isAssetInCollection =
    (collection.items || []).find((item) => item.asset === assetId) !==
    undefined
  const classes = useStyles()

  return (
    <MenuItem onClick={onClick} className={classes.item}>
      <Tooltip
        title={`${
          collection.description || '(no description)'
        } - created ${getFriendlyDate(collection.createdat)}`}>
        <span>
          {collection.title || '(unnamed)'} ({(collection.items || []).length})
          {isSaving ? (
            <StatusText positivity={0}>Saving...</StatusText>
          ) : savedMessage ? (
            <StatusText positivity={1}>{savedMessage}</StatusText>
          ) : null}
        </span>
      </Tooltip>
      <span>
        {isAssetInCollection ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />}
      </span>
    </MenuItem>
  )
}

const CollectionListItem = ({
  assetId,
  collection,
  hydrate,
  onDone,
}: {
  assetId: string
  collection: Collection
  hydrate: () => Promise<void>
  onDone: () => void
}) => {
  const [isSaving, isSavingSuccess, lastErrorCode, saveCollection] =
    useDataStoreEdit<Collection>(CollectionNames.Collections, collection.id)

  const isAssetInCollection =
    (collection.items || []).find((item) => item.asset === assetId) !==
    undefined

  const isAssetInCollectionRef = useRef(isAssetInCollection)

  const onClick = async () => {
    try {
      const existingItems = [...(collection.items || [])]

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

      isAssetInCollectionRef.current = !isAssetInCollection

      await hydrate()

      // close after delay
      onDone()
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  return (
    <>
      <ListItem
        assetId={assetId}
        collection={collection}
        onClick={onClick}
        isSaving={isSaving}
        savedMessage={
          isSavingSuccess
            ? isAssetInCollectionRef.current
              ? 'Added to collection, closing...'
              : 'Removed from collection, closing...'
            : undefined
        }
      />
      {lastErrorCode !== null ? (
        <ErrorMessage>Failed to save (code {lastErrorCode})</ErrorMessage>
      ) : null}
    </>
  )
}

const OwnedAssetsCollectionListItem = ({
  assetId,
  onDone,
}: {
  assetId: string
  onDone: (newValue: boolean) => void
}) => {
  const userId = useUserId()!
  const [
    isLoadingCollection,
    lastLoadingErrorCode,
    collectionForUser,
    hydrate,
  ] = useDataStoreItem<CollectionForUser>(
    CollectionNames.CollectionsForUsers,
    userId
  )
  const [isEditing, isSavingSuccess, lastSavingErrorCode, save] =
    useDataStoreEdit<CollectionForUser>(
      CollectionNames.CollectionsForUsers,
      collectionForUser ? userId : false,
      { queryName: 'save-collection-for-user' }
    )
  const [isCreating, isCreatingSuccess, lastCreatingErrorCode, create] =
    useDataStoreCreate<CollectionForUser>(CollectionNames.CollectionsForUsers, {
      queryName: 'create-collection-for-user',
    })

  const isAssetInMyCollection = collectionForUser
    ? collectionForUser.assets.includes(assetId)
    : false
  const assetIdsInMyCollection = collectionForUser
    ? collectionForUser.assets
    : []

  const onClick = async () => {
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

      await hydrate()

      // close after delay
      onDone(!isAssetInMyCollection)
    } catch (err) {
      console.error('Failed to save collection for user', err)
      handleError(err)
    }
  }

  // @ts-ignore
  const collection: Collection = {
    id: userId,
    title: 'Your Owned Assets',
    description: 'Any asset you have purchased or downloaded.',
    items: collectionForUser
      ? collectionForUser.assets.map((assetId) => ({ asset: assetId }))
      : [],
  }

  if (isLoadingCollection && !collectionForUser) {
    return <LoadingListItem />
  }

  const isSaving = isEditing || isCreating

  return (
    <>
      <ListItem
        assetId={assetId}
        collection={collection}
        isSaving={isSaving}
        onClick={onClick}
        savedMessage={
          (isSavingSuccess || isCreatingSuccess) && !isLoadingCollection
            ? isAssetInMyCollection
              ? 'Added to collection, closing...'
              : 'Removed from collection, closing...'
            : undefined
        }
      />
      {lastLoadingErrorCode !== null ? (
        <ErrorMessage>
          Failed to load (code {lastLoadingErrorCode})
        </ErrorMessage>
      ) : null}
      {lastSavingErrorCode || lastCreatingErrorCode !== null ? (
        <ErrorMessage>
          Failed to save (code{' '}
          {lastSavingErrorCode !== null
            ? lastSavingErrorCode
            : lastCreatingErrorCode}
          )
        </ErrorMessage>
      ) : null}
    </>
  )
}

const LoadingListItem = () => {
  const classes = useStyles()
  return (
    <MenuItem className={classes.item}>
      <LoadingShimmer width={getRandomInt(150, 300)} height={15} />
    </MenuItem>
  )
}

const CollectionsList = ({
  assetId,
  onDone,
}: {
  assetId: string
  onDone: () => void
}) => {
  const [isLoading, lastErrorCode, collections, , hydrate] = useMyCollections()
  const classes = useStyles()

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>
        Failed to load your collection (code {lastErrorCode})
      </ErrorMessage>
    )
  }

  const onCreatedCollection = (autoAddedAsset: boolean) => {
    if (autoAddedAsset) {
      onDone()
    } else {
      hydrate()
    }
  }

  return (
    <div className={classes.root}>
      <Heading variant="h2" noMargin>
        Default Collections
      </Heading>
      <div className={classes.items}>
        <OwnedAssetsCollectionListItem assetId={assetId} onDone={onDone} />
      </div>
      <Heading variant="h2" noMargin>
        Custom Collections{collections ? ` (${collections.length})` : null}
      </Heading>
      <Button
        url={routes.myAccountWithTabNameVar.replace(':tabName', 'collection')}
        size="small"
        color="secondary">
        View My Collections (redirects)
      </Button>
      <div className={classes.items}>
        {collections ? (
          collections.length ? (
            collections.map((collection) => (
              <CollectionListItem
                key={collection.id}
                assetId={assetId}
                collection={collection}
                hydrate={hydrate}
                onDone={onDone}
              />
            ))
          ) : (
            <NoResultsMessage>No collections yet</NoResultsMessage>
          )
        ) : (
          <>
            <LoadingListItem />
            <LoadingListItem />
            <LoadingListItem />
            <LoadingListItem />
            <LoadingListItem />
          </>
        )}
      </div>
      <Heading variant="h2">Create Collection</Heading>
      <CreateCollectionForm onDone={onCreatedCollection} assetId={assetId} />
    </div>
  )
}

const AddToCollectionButton = ({
  assetId,
  isAssetLoading,
  onClick,
}: {
  assetId: string
  isAssetLoading: boolean
  onClick: () => void
}) => {
  if (!assetId) {
    throw new Error('Need asset id')
  }

  const [isOpen, setIsOpen] = useState(false)
  const timerRef = useRef()
  const isLoggedIn = useIsLoggedIn()
  const close = () => setIsOpen(false)
  const closeAfterDelay = useTimer(close)

  useEffect(() => {
    return () => clearTimeout(timerRef.current)
  }, [])

  const onClickMainButton = () => {
    setIsOpen((currentVal) => !currentVal)
    onClick()
  }

  const onDone = () => {
    closeAfterDelay()
  }

  return (
    <ErrorBoundary>
      <Button
        icon={<PlaylistAddIcon />}
        onClick={onClickMainButton}
        color="secondary"
        isLoading={isAssetLoading}>
        {isLoggedIn ? 'Add To Collection...' : 'Log in to add to collection'}
      </Button>
      {isOpen && (
        <Dialog onClose={close}>
          <CollectionsList assetId={assetId} onDone={onDone} />
        </Dialog>
      )}
    </ErrorBoundary>
  )
}

export default AddToCollectionButton
