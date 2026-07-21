import React, { useState } from 'react'
import { makeStyles } from '@mui/styles'

import { AttachmentType } from '@/modules/attachments'
import { trackAction } from '@/analytics'
import { mediaQueryForMobiles } from '@/media-queries'

import ImageGallery from '@/components/image-gallery'

import useAssetOverview from '../../useAssetOverview'
import ErrorMessage from '@/components/error-message'

const useStyles = makeStyles({
  root: {
    width: '100%',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    [mediaQueryForMobiles]: {
      height: '',
    },
  },
  primary: {
    minHeight: '224px', // 3x 16/9 scaled down
    maxWidth: '33.3%',
    margin: '0.5rem',
    padding: 0,
    cursor: 'pointer',
    transition: 'all 100ms',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& img': {
      display: 'block',
      maxWidth: '100%',
      objectFit: 'contain', // (default: fill) required to fix stretched images on Edge
    },
    [mediaQueryForMobiles]: {
      maxWidth: '100%',
    },
  },
  placeholder: {
    width: '100%',
    height: '100%',
    background: 'rgba(255, 255, 255, 0.1)',
  },
})

const analyticsCategoryName = 'ViewAsset'

const cleanupAttachmentUrl = (url: string) =>
  url.replace('host.docker.internal:54321', 'localhost:54321')

const PrimaryImage = () => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const { asset, isLoading } = useAssetOverview()
  const classes = useStyles()

  // fix showing a stale asset image until new one is loaded
  if (isLoading) {
    return null
  }

  if (!asset) {
    return (
      <div className={classes.root}>
        <div className={`${classes.primary} ${classes.placeholder}`} />
      </div>
    )
  }

  if (!asset.attachmentids.length) {
    if (asset.thumbnailurl) {
      return (
        <div className={classes.root}>
          <div className={classes.primary}>
            <img src={asset.thumbnailurl} alt="Thumbnail for asset" />
          </div>
        </div>
      )
    }

    return null
  }

  const bestImageAttachment = asset.attachmentsdata?.find(
    (attachment) => attachment.type === AttachmentType.Image
  )

  if (!bestImageAttachment) {
    return (
      <ErrorMessage>
        No primary image found (IDs: {asset.attachmentids.join(',')})
      </ErrorMessage>
    )
  }

  if (isGalleryOpen) {
    return (
      <ImageGallery
        startSelected
        images={asset.attachmentsdata?.slice(0, 3).map((attachment) => ({
          id: attachment.id,
          url: cleanupAttachmentUrl(attachment.url),
        }))}
        onClickImage={() =>
          trackAction(
            analyticsCategoryName,
            'Click attached image thumbnail to open gallery'
          )
        }
        onMoveNext={() =>
          trackAction(analyticsCategoryName, 'Click go next image in gallery')
        }
        onMovePrev={() =>
          trackAction(analyticsCategoryName, 'Click go prev image in gallery')
        }
      />
    )
  }

  return (
    <div className={classes.root}>
      <div className={classes.primary} onClick={() => setIsGalleryOpen(true)}>
        <img
          src={cleanupAttachmentUrl(bestImageAttachment.url)}
          alt="Attachment for asset"
        />
      </div>
    </div>
  )
}

export default PrimaryImage
