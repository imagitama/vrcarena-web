import React from 'react'
import { BANNER_WIDTH, BANNER_HEIGHT } from '../../config'
import { bucketNames } from '../../file-uploading'
import ErrorMessage from '../error-message'
import ImageUploader from '../image-uploader'

export default ({
  assetId,
  onDone
}: {
  assetId: string
  onDone: (urls: string[]) => void
}) =>
  assetId ? (
    <ImageUploader
      bucketName={bucketNames.assetBanners}
      directoryPath={assetId}
      onDone={onDone}
      requiredWidth={BANNER_WIDTH}
      requiredHeight={BANNER_HEIGHT}
    />
  ) : (
    <ErrorMessage>Need an asset ID to upload banners</ErrorMessage>
  )
