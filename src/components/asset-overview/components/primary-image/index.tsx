import React, { useState } from 'react'
import { makeStyles } from '@mui/styles'
import useAssetOverview from '../../useAssetOverview'
import ImageGallery from '@/components/image-gallery'
import { AttachmentType } from '@/modules/attachments'
import { trackAction } from '@/analytics'
import { mediaQueryForMobiles } from '@/media-queries'

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
      // maxHeight: '400px',
      aspectRatio: '1/1',
      objectFit: 'contain', // (default: fill) required to fix stretched images on Edge
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
  const { asset } = useAssetOverview()
  const classes = useStyles()

  if (!asset || !asset.attachmentsdata) {
    return (
      <div className={classes.root}>
        <div className={`${classes.primary} ${classes.placeholder}`} />
      </div>
    )
  }

  const bestImageAttachment = asset.attachmentsdata.find(
    (attachment) => attachment.type === AttachmentType.Image
  )

  if (!bestImageAttachment) {
    return null
  }

  if (isGalleryOpen) {
    return (
      <ImageGallery
        startSelected
        images={asset.attachmentsdata.slice(0, 3).map((attachment) => ({
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
