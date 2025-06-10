import React, { useRef, useEffect } from 'react'

import useDatabaseSave from '../../hooks/useDatabaseSave'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import SuccessMessage from '../success-message'
import ImageUploader from '../image-uploader'

import { handleError } from '../../error-handling'
import {
  formHideDelay,
  THUMBNAIL_WIDTH,
  THUMBNAIL_HEIGHT,
  NONATTACHMENT_MAX_SIZE_BYTES,
} from '../../config'
import { bucketNames } from '../../file-uploading'
import { Asset, CollectionNames } from '../../modules/assets'

export default ({
  assetId = undefined,
  onDone = undefined,
  skipDelay = false,
  preloadImageUrl = undefined,
  preloadFile = undefined,
  overrideSave = undefined,
  assetIdForBucket = undefined,
}: {
  assetId?: string
  onDone?: () => void
  skipDelay?: boolean
  preloadImageUrl?: string
  preloadFile?: File
  overrideSave?: (url: string) => void
  // for amendments to work
  assetIdForBucket?: string
}) => {
  const [isSaving, isSuccess, lastErrorCode, save] = useDatabaseSave<Asset>(
    CollectionNames.Assets,
    assetId
  )
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  if (isSaving) {
    return <LoadingIndicator message="Saving..." />
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>
        Failed to save thumbnail (code {lastErrorCode})
      </ErrorMessage>
    )
  }

  if (isSuccess) {
    return <SuccessMessage>Thumbnail has been changed!</SuccessMessage>
  }

  const onUploaded = async (urls: string[]) => {
    try {
      const url = urls[0]

      if (overrideSave) {
        overrideSave(url)

        if (onDone) {
          onDone()
        }
        return
      }

      if (!assetId) {
        return
      }

      await save({
        thumbnailurl: url,
      })

      if (onDone) {
        if (skipDelay) {
          onDone()
        } else {
          // this could not happen if we remount the whole component when avatar URL changes
          timeoutRef.current = setTimeout(() => onDone(), formHideDelay)
        }
      }
    } catch (err) {
      console.error('Failed to upload thumbnail for asset', err)
      handleError(err)
    }
  }

  return (
    <ImageUploader
      onDone={onUploaded}
      bucketName={bucketNames.assetThumbnails}
      directoryPath={assetIdForBucket || assetId || ''}
      requiredWidth={THUMBNAIL_WIDTH}
      requiredHeight={THUMBNAIL_HEIGHT}
      preloadFile={preloadFile}
      preloadImageUrl={preloadImageUrl}
      maxSizeBytes={NONATTACHMENT_MAX_SIZE_BYTES}
    />
  )
}
