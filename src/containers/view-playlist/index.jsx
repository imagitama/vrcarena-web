import React from 'react'
import { Helmet } from 'react-helmet'
import { Link, useParams } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'

import * as routes from '../../routes'

import Markdown from '../../components/markdown'
import ErrorMessage from '../../components/error-message'
import LoadingIndicator from '../../components/loading-indicator'
import AssetResultsItem from '../../components/asset-results-item'
import Heading from '../../components/heading'
import Button from '../../components/button'
import EditorRecordManager from '../../components/editor-record-manager'
import Message from '../../components/message'

import useUserRecord from '../../hooks/useUserRecord'
import { AccessStatuses } from '../../hooks/useDatabaseQuery'
import {
  CommonMetaFieldNames,
  CollectionNames,
  PlaylistsFieldNames,
  PlaylistItemsFieldNames
} from '../../data-store'
import { canEditAuthor } from '../../utils'
import { mediaQueryForTabletsOrBelow } from '../../media-queries'
import useDataStoreItem from '../../hooks/useDataStoreItem'

const GetFullPlaylistsFieldNames = {
  lastModifiedByUsername: 'lastmodifiedbyusername',
  createdByUsername: 'createdbyusername',
  itemsAssetData: 'itemsassetdata'
}

const useStyles = makeStyles({
  categories: {
    marginTop: '0',
    marginBottom: '1rem',
    fontSize: '150%'
  },
  findMoreAuthorsBtn: {
    marginTop: '3rem',
    textAlign: 'center'
  },
  icon: {
    '& svg': {
      verticalAlign: 'middle',
      width: 'auto',
      height: '1em'
    }
  },
  cols: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  col: {
    width: 'calc(50% - 0.5rem)',
    margin: '0 0.5rem 0 0',
    '&:last-child': {
      margin: '0 0 0 0.5rem'
    },
    [mediaQueryForTabletsOrBelow]: {
      width: '100%'
    }
  },
  title: {
    textAlign: 'center'
  },
  avatar: {
    display: 'inline-block'
  },
  desc: {
    textAlign: 'center'
  },
  itemInPlaylist: {
    margin: '1rem 0',
    display: 'flex'
  },
  colRight: {
    marginLeft: '2rem'
  }
})

const ItemInPlaylist = ({ item, itemAssetData }) => {
  const classes = useStyles()

  return (
    <div className={classes.itemInPlaylist}>
      <div className={classes.colLeft}>
        <AssetResultsItem asset={itemAssetData} />
      </div>
      <div className={classes.colRight}>
        {item[PlaylistItemsFieldNames.comments]}
      </div>
    </div>
  )
}

const ItemsInPlaylist = ({ items, itemsAssetData }) => {
  const classes = useStyles()

  return (
    <div className={classes.itemsInPlaylist}>
      {items
        ? items.map((item, idx) => (
            <ItemInPlaylist
              item={item}
              itemAssetData={itemsAssetData.find(({ id }) => id === item.asset)}
            />
          ))
        : '(no items)'}
    </div>
  )
}

const analyticsCategory = 'ViewPlaylist'

const View = () => {
  const { playlistId } = useParams()
  const [, , user] = useUserRecord()
  const [isLoading, isErrored, result, hydrate] = useDataStoreItem(
    'getfullplaylists',
    playlistId,
    'view-playlist'
  )
  const classes = useStyles()

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to get playlist</ErrorMessage>
  }

  if (!result) {
    return <ErrorMessage>The playlist does not exist</ErrorMessage>
  }

  const {
    [PlaylistsFieldNames.title]: title,
    [PlaylistsFieldNames.description]: description,
    [PlaylistsFieldNames.items]: items,
    [PlaylistsFieldNames.lastModifiedBy]: lastModifiedBy,

    // view
    [GetFullPlaylistsFieldNames.createdByUsername]: createdByUsername,
    [GetFullPlaylistsFieldNames.lastModifiedByUsername]: lastModifiedByUsername,
    [GetFullPlaylistsFieldNames.itemsAssetData]: itemsAssetData,

    // meta
    [CommonMetaFieldNames.publishStatus]: publishStatus,
    [CommonMetaFieldNames.accessStatus]: accessStatus,
    [CommonMetaFieldNames.approvalStatus]: approvalStatus,
    [CommonMetaFieldNames.editorNotes]: editorNotes,
    [CommonMetaFieldNames.createdBy]: createdBy
  } = result

  const isDeleted = accessStatus === AccessStatuses.Deleted

  return (
    <>
      <Helmet>
        <title>{title} | VRCArena</title>
        <meta
          name="description"
          content={`Browse all of the assets in the user-created playlist "${title}".`}
        />
      </Helmet>

      {isDeleted !== false && <Message>This author has been deleted</Message>}
      {editorNotes && (
        <Message>
          <strong>Notes from our staff</strong>
          <br />
          <br />
          {editorNotes}
        </Message>
      )}

      <div className={classes.cols}>
        <div className={classes.col}>
          <div className={classes.title}>
            <div className={classes.avatar} />
            <Heading variant="h1">
              <Link
                to={routes.viewPlaylistWithVar.replace(
                  ':playlistId',
                  playlistId
                )}>
                {title}
              </Link>
            </Heading>
          </div>

          {description && (
            <Markdown source={description} className={classes.desc} />
          )}
        </div>
        <div className={classes.col}>
          <ItemsInPlaylist items={items} itemsAssetData={itemsAssetData} />
        </div>
      </div>

      {canEditAuthor(user, result) && (
        <>
          <Heading variant="h2">Actions</Heading>
          <Button
            url={routes.editPlaylistWithVar.replace(':playlistId', playlistId)}>
            Edit
          </Button>
          <EditorRecordManager
            id={playlistId}
            metaCollectionName={CollectionNames.AuthorsMeta}
            existingApprovalStatus={approvalStatus}
            existingPublishStatus={publishStatus}
            existingAccessStatus={accessStatus}
            existingEditorNotes={editorNotes}
            onDone={() => hydrate()}
          />
        </>
      )}

      <Heading variant="h2">Meta</Heading>
      <div>
        Created by{' '}
        <Link to={routes.viewUserWithVar.replace(':userId', createdBy)}>
          {createdByUsername}
        </Link>
      </div>

      {lastModifiedBy && (
        <div>
          Last modified by{' '}
          <Link to={routes.viewUserWithVar.replace(':userId', lastModifiedBy)}>
            {lastModifiedByUsername}
          </Link>
        </div>
      )}
    </>
  )
}

export default () => (
  <>
    <Helmet>
      <title>View a playlist | VRCArena</title>
      <meta
        name="description"
        content="Browse all of the assets inside a playlist."
      />
    </Helmet>
    <View />
  </>
)
