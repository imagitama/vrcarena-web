import React, { useRef, useEffect } from 'react'

import { CollectionNames, AssetFieldNames } from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import SuccessMessage from '../success-message'
import WarningMessage from '../warning-message'
import ImageUploader from '../image-uploader'

import { handleError } from '../../error-handling'
import {
  formHideDelay,
  THUMBNAIL_WIDTH,
  THUMBNAIL_HEIGHT,
  NONATTACHMENT_MAX_SIZE_BYTES
} from '../../config'
import { bucketNames } from '../../file-uploading'

export default ({
  assetId = undefined,
  onDone = undefined,
  skipDelay = false,
  preloadImageUrl = undefined,
  preloadFile = undefined,
  overrideSave = undefined,
  assetIdForBucket = undefined
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
  const [isSaving, isSuccess, isErrored, save] = useDatabaseSave(
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

  if (isErrored) {
    return <ErrorMessage>Failed to save thumbnail</ErrorMessage>
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
        [AssetFieldNames.thumbnailUrl]: url
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
    <>
      <WarningMessage noTopMargin>
        As of April 2023 we are migrating to a new way of uploading thumbnails.
        Please contact me (Peanut#1756) if you experience any issues with this
      </WarningMessage>
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
    </>
  )
}
