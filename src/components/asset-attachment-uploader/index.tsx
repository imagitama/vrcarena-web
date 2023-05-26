import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import SaveIcon from '@material-ui/icons/Save'
import ImageIcon from '@material-ui/icons/Image'
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile'
import DeleteIcon from '@material-ui/icons/Delete'
import YouTubeIcon from '@material-ui/icons/YouTube'
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward'
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward'

import {
  isUrlAnImage,
  isUrlAVideo,
  getFilenameFromUrl,
  isUrlAYoutubeVideo,
  isInternalUrl
} from '../../utils'
import { THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT } from '../../config'
import {
  CollectionNames,
  AssetFieldNames,
  options
} from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import { handleError } from '../../error-handling'
import { trackAction } from '../../analytics'

import FileUploader from '../file-uploader'
import VideoPlayer from '../video-player'
import LoadingIndicator from '../loading-indicator'
import Button from '../button'
import ErrorMessage from '../error-message'
import ImageUploader from '../image-uploader'
import useDataStoreItem from '../../hooks/useDataStoreItem'
import { bucketNames } from '../../file-uploading'
import { Asset } from '../../modules/assets'
import UrlSelector from '../url-selector'
import Paper from '../paper'
import YoutubePlayer from '../youtube-player'
import WarningMessage from '../warning-message'

const useStyles = makeStyles({
  uploader: { padding: '2rem' },
  image: {
    maxWidth: THUMBNAIL_WIDTH,
    maxHeight: THUMBNAIL_HEIGHT
  },
  btns: {
    textAlign: 'center',
    marginTop: '1rem'
  },
  items: {
    display: 'flex',
    justifyContent: 'center',
    justifyItems: 'center',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  item: { maxWidth: '50%', margin: '0 0 1rem 0', padding: '2rem' },
  itemControls: {
    marginTop: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    justifyItems: 'center',
    '& > *': {
      marginRight: '0.25rem'
    }
  }
})

const FileAttacherItem = ({
  url,
  onRemove,
  onMoveUp,
  onMoveDown,
  showMoveUpAndDownBtns = true
}: {
  url: string
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  showMoveUpAndDownBtns?: boolean
}) => {
  const classes = useStyles()

  const linkText = isInternalUrl(url) ? '' : getFilenameFromUrl(url)

  return (
    <div className={classes.item}>
      {isUrlAnImage(url) && (
        <img
          src={url}
          className={classes.image}
          alt="Preview of the attached file"
        />
      )}
      {isUrlAVideo(url) && <VideoPlayer url={url} />}
      {isUrlAYoutubeVideo(url) && <YoutubePlayer url={url} width="100%" />}
      {linkText ? (
        <>
          <br />
          <a href={url} target="_blank" rel="noopener noreferrer">
            {linkText}
          </a>
        </>
      ) : null}
      <div className={classes.itemControls}>
        {showMoveUpAndDownBtns && (
          <>
            <Button
              color="default"
              onClick={onMoveUp}
              icon={<ArrowUpwardIcon />}
              iconOnly
              size="small"
            />
            <Button
              color="default"
              onClick={onMoveDown}
              icon={<ArrowDownwardIcon />}
              iconOnly
              size="small"
            />
          </>
        )}{' '}
        <Button
          color="default"
          onClick={onRemove}
          icon={<DeleteIcon />}
          iconOnly
          size="small"
        />
      </div>
    </div>
  )
}

function moveItemInArray(from: number, to: number, arr: any[]): any[] {
  // @ts-ignore
  const newArray = [].concat(arr)
  newArray.splice(to, 0, newArray.splice(from, 1)[0])
  return newArray
}

const attachmentTypes = {
  Image: 'image',
  File: 'file',
  URL: 'url'
}

export default ({
  assetId = undefined,
  existingFileUrls = undefined,
  onDone = undefined,
  limit = undefined,
  onlyImage = false,
  overrideSave = undefined
}: {
  assetId?: string
  existingFileUrls?: string[]
  onDone?: () => void
  limit?: number
  onlyImage?: boolean
  overrideSave?: (fileUrls: string[]) => void
}) => {
  const [attachmentType, setAttachmentType] = useState<string | null>(null)
  const [newFileUrls, setNewFileUrls] = useState(
    existingFileUrls ? existingFileUrls : []
  )
  const [isLoading, isErrored, asset] = useDataStoreItem<Asset>(
    CollectionNames.Assets,
    existingFileUrls && assetId ? assetId : false,
    `asset-attachment-uploader-${assetId || 'none'}`
  )
  const [isSaving, , isFailed, save] = useDatabaseSave(
    CollectionNames.Assets,
    assetId
  )
  const classes = useStyles()

  const onFileAttached = (fileUrl: string) => {
    if (newFileUrls.includes(fileUrl)) {
      console.warn(`URL is already attached: ${fileUrl}`)
      return
    }

    setNewFileUrls(newFileUrls.concat([fileUrl]))
    setAttachmentType(null)
  }

  const onFileRemoved = (urlToRemove: string) => {
    setNewFileUrls(
      newFileUrls.filter(urlOrUrls => {
        return urlOrUrls !== urlToRemove
      })
    )
  }

  useEffect(() => {
    if (!asset || existingFileUrls) {
      return
    }

    const urls = asset.fileurls || []

    setNewFileUrls(urls)
  }, [asset !== null])

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isSaving) {
    return <LoadingIndicator message="Saving..." />
  }

  if (isFailed) {
    return <ErrorMessage>Failed to save attachments</ErrorMessage>
  }

  if (isErrored) {
    return <ErrorMessage>Failed to load asset</ErrorMessage>
  }

  const moveFileUp = (urlToMove: string) => {
    const originalIndex = newFileUrls.findIndex(item => {
      return item === urlToMove
    })

    if (originalIndex === 0) {
      return
    }

    setNewFileUrls(
      moveItemInArray(originalIndex, originalIndex - 1, newFileUrls)
    )
  }

  const moveFileDown = (urlToMove: string) => {
    const originalIndex = newFileUrls.findIndex(item => {
      return item === urlToMove
    })

    if (originalIndex === newFileUrls.length - 1) {
      return
    }

    setNewFileUrls(
      moveItemInArray(originalIndex, originalIndex + 1, newFileUrls)
    )
  }

  const onSaveBtnClick = async () => {
    try {
      if (overrideSave) {
        overrideSave(newFileUrls)
        if (onDone) {
          onDone()
        }
        return
      }

      if (!assetId) {
        return
      }

      trackAction('ViewAsset', 'Click save asset attachments button', assetId)

      await save({
        [AssetFieldNames.fileUrls]: newFileUrls
      })

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  const cancel = () => setAttachmentType(null)

  return (
    <div className={classes.uploader}>
      <div className={classes.items}>
        {newFileUrls && newFileUrls.length ? (
          newFileUrls.map(url => (
            <FileAttacherItem
              key={url}
              url={url}
              onRemove={() => onFileRemoved(url)}
              onMoveUp={() => moveFileUp(url)}
              onMoveDown={() => moveFileDown(url)}
              showMoveUpAndDownBtns={newFileUrls && newFileUrls.length > 1}
            />
          ))
        ) : (
          <p>No files attached yet</p>
        )}
      </div>

      <Paper>
        {attachmentType === attachmentTypes.Image ? (
          <ImageUploader
            bucketName={bucketNames.attachments}
            directoryPath=""
            onDone={url => onFileAttached(url)}
          />
        ) : attachmentType === attachmentTypes.File ? (
          <>
            <strong>
              We do not want to host any of the files of your asset files.
              Please use a 3rd party service such as Google Drive.
            </strong>
            <FileUploader
              bucketName={bucketNames.attachments}
              directoryPath=""
              onDone={url => onFileAttached(url)}
            />
          </>
        ) : attachmentType === attachmentTypes.URL ? (
          <UrlSelector onDone={url => onFileAttached(url)} />
        ) : (
          <>
            {!limit || (limit && newFileUrls && newFileUrls.length < limit) ? (
              <Button
                onClick={() => setAttachmentType(attachmentTypes.Image)}
                color="default"
                icon={<ImageIcon />}>
                Attach Image
              </Button>
            ) : null}{' '}
            {onlyImage !== true && (
              <>
                <Button
                  onClick={() => setAttachmentType(attachmentTypes.File)}
                  color="default"
                  icon={<InsertDriveFileIcon />}>
                  Attach File
                </Button>{' '}
                <Button
                  onClick={() => setAttachmentType(attachmentTypes.URL)}
                  color="default"
                  icon={<YouTubeIcon />}>
                  Attach Youtube (or other) URL
                </Button>
              </>
            )}
            <div className={classes.btns}>
              <WarningMessage>
                Please remember to click the save button below
              </WarningMessage>
              <Button onClick={onSaveBtnClick} icon={<SaveIcon />}>
                Save
              </Button>
            </div>
          </>
        )}

        {attachmentType !== null ? (
          <>
            <br />
            <br />
            <Button color="default" onClick={cancel}>
              Cancel Everything
            </Button>
          </>
        ) : null}
      </Paper>
    </div>
  )
}
