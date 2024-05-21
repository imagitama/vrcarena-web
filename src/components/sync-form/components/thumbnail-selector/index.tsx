import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'

import useSync from '../../hooks/useSync'
import Button from '../../../button'
import ImageUploader from '../../../image-uploader'
import { bucketNames } from '../../../../file-uploading'
import { THUMBNAIL_HEIGHT, THUMBNAIL_WIDTH } from '../../../../config'
import NoResultsMessage from '../../../no-results-message'
import WarningMessage from '../../../warning-message'

const useStyles = makeStyles((theme) => ({
  root: {},
  thumbnailsToSelect: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    '& > div': {
      margin: '0 0.5rem 0.5rem 0',
      cursor: 'pointer',
    },
  },
}))

const ThumbnailSelector = ({
  overrideUrl,
  finalUrl,
  imageUrls,
  onDone,
}: {
  overrideUrl?: string
  finalUrl: string
  imageUrls: string[]
  onDone: (finalUrl: string) => void
}) => {
  const [selectedUrl, setSelectedUrl] = useState(overrideUrl || '')
  const { parentId } = useSync()
  const classes = useStyles()

  if (!overrideUrl && !imageUrls.length) {
    return <NoResultsMessage>No images were found</NoResultsMessage>
  }

  if (finalUrl) {
    return (
      <>
        <img src={finalUrl} width={THUMBNAIL_WIDTH} height={THUMBNAIL_HEIGHT} />
        <br />
        <Button
          onClick={() => {
            setSelectedUrl('')
            onDone('')
          }}
          color="default">
          Retry
        </Button>
      </>
    )
  }

  if (selectedUrl) {
    return (
      <ImageUploader
        bucketName={bucketNames.assetThumbnails}
        directoryPath={parentId}
        preloadImageUrl={selectedUrl}
        requiredWidth={THUMBNAIL_WIDTH}
        requiredHeight={THUMBNAIL_HEIGHT}
        onDone={(urls) => onDone(urls[0])}
        onCancel={!overrideUrl ? () => setSelectedUrl('') : undefined}
      />
    )
  }

  return (
    <div className={classes.root}>
      <WarningMessage leftAlign>Select an image to crop:</WarningMessage>
      <div className={classes.thumbnailsToSelect}>
        {imageUrls.map((url) => {
          return (
            <div key={url} onClick={() => setSelectedUrl(url)}>
              <img src={url} width={200} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ThumbnailSelector
