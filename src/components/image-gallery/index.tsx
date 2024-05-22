import React, { useRef, useState } from 'react'
import { makeStyles } from '@material-ui/styles'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import VideoPlayer from '../video-player'
import LoadingShimmer from '../loading-shimmer'
import {
  getImageUrlFromYouTubeUrl,
  getRandomInt,
  isUrlAYoutubeVideo,
} from '../../utils'
import Button from '../button'
import { useMediaQuery } from 'react-responsive'
import { mediaQueryForMobiles, queryForMobiles } from '../../media-queries'

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
  image: {
    maxWidth: '33.3%',
    margin: '0.5rem',
    cursor: 'pointer',
    transition: 'all 100ms',
    '& img': {
      maxWidth: '100%',
      maxHeight: '400px',
      aspectRatio: '1/1',
      objectFit: 'contain', // (default: fill) required to fix stretched images on Edge
    },
  },
  '& $image': {
    transform: 'scale(1.05)',
  },
  expanded: {
    height: 'auto',
    '& $image': {
      maxWidth: '100%',
      maxHeight: '100vh',
    },
    '& $image img': {
      width: 'auto',
      maxHeight: 'inherit',
    },
    '& $image:hover': {
      transform: false,
    },
    [mediaQueryForMobiles]: {
      height: 'auto',
    },
  },
  btn: {
    fontSize: '2rem',
    opacity: 0,
    transition: 'all 100ms',
    display: 'flex',
    alignItems: 'center',
    '& svg': {
      fontSize: '100%',
    },
    [mediaQueryForMobiles]: {
      position: 'absolute',
      background: 'rgba(0, 0, 0, 1)',
    },
  },
  visible: {
    opacity: 0.5,
    '&:hover': {
      cursor: 'pointer',
      opacity: 1,
    },
  },
  btnLeft: {
    left: 0,
  },
  btnRight: {
    right: 0,
  },
  caption: {
    marginTop: '0.5rem',
  },
  videoPlayerControls: {
    marginTop: '0.25rem',
    display: 'flex',
    justifyContent: 'right',
  },
  youtube: {
    width: 'calc(100vw - 20rem)',
    [mediaQueryForMobiles]: {
      width: 'auto',
    },
  },
  shimmer: {
    width: '30rem',
    display: 'flex',
    alignItems: 'center',
  },
  hidden: {
    display: 'none',
  },
})

const Image = ({
  image,
  onClick,
  isSelected,
  isExpanded,
}: {
  image: ImageDetails
  onClick: () => void
  isSelected?: boolean
  isExpanded?: boolean
}) => {
  const classes = useStyles()
  const isMobile = useMediaQuery({ query: queryForMobiles })
  const isYoutube = isUrlAYoutubeVideo(image.url)

  return (
    <div
      className={`${classes.image} ${
        isExpanded && isYoutube ? classes.youtube : ''
      } ${isExpanded && !isSelected ? classes.hidden : ''}`}>
      {isExpanded && isYoutube ? (
        <>
          <VideoPlayer url={image.url} autoplay width="100%" height="500px" />
          {isMobile ? null : (
            <div className={classes.videoPlayerControls}>
              <Button onClick={() => onClick()}>Close Player</Button>
            </div>
          )}
        </>
      ) : (
        <img
          src={
            isYoutube
              ? getImageUrlFromYouTubeUrl(image.url)
              : image.thumbnailUrl || image.url
          }
          alt={image.alt || ''}
          onClick={() => onClick()}
        />
      )}
      {image.caption ? (
        <div className={classes.caption}>{image.caption}</div>
      ) : null}
    </div>
  )
}

const LoadingShimmers = ({ count }: { count: number }) => {
  const classes = useStyles()

  // store as ref to avoid re-drawing each re-render
  const sizesRefs = useRef([
    getRandomInt(200, 300),
    getRandomInt(200, 300),
    getRandomInt(200, 300),
  ])

  const shimmers = []

  for (let i = 0; i < count; i++) {
    shimmers.push(
      <div className={`${classes.image} ${classes.shimmer}`}>
        <LoadingShimmer height={sizesRefs.current[i]} />
      </div>
    )
  }

  return <>{shimmers}</>
}

export interface ImageDetails {
  id?: string
  alt?: string // alt
  caption?: string | React.ReactElement
  url: string
  thumbnailUrl?: string
}

const ImageGallery = ({
  images,
  onClickImage,
  onMoveNext,
  onMovePrev,
  showLoadingCount,
}: {
  images?: ImageDetails[]
  onClickImage?: (image: ImageDetails) => void
  onMoveNext?: () => void
  onMovePrev?: () => void
  showLoadingCount?: number
}) => {
  const classes = useStyles()
  const isMobile = useMediaQuery({ query: queryForMobiles })
  const [selectedIdx, setSelectedIdx] = useState<null | number>(
    isMobile ? 0 : null
  )

  return (
    <div
      className={`${classes.root} ${
        selectedIdx !== null ? classes.expanded : ''
      }`}>
      {showLoadingCount ? (
        <LoadingShimmers count={showLoadingCount} />
      ) : (
        <>
          <div
            className={`${classes.btn} ${classes.btnLeft} ${
              selectedIdx !== null && selectedIdx > 0 ? classes.visible : ''
            }`}
            onClick={() => {
              setSelectedIdx((currentVal) => {
                if (currentVal !== null && currentVal > 0) {
                  return currentVal - 1
                }
                return currentVal
              })

              if (onMovePrev) {
                onMovePrev()
              }
            }}>
            <ChevronLeftIcon />
          </div>
          {images
            ? images.map((image, i) => (
                <Image
                  key={image.id || image.url}
                  image={image}
                  isSelected={selectedIdx === i}
                  isExpanded={selectedIdx !== null}
                  onClick={() => {
                    setSelectedIdx((currentVal) => {
                      if (currentVal === i) {
                        return null
                      }
                      return i
                    })

                    if (onClickImage) {
                      onClickImage(image)
                    }
                  }}
                />
              ))
            : null}
          <div
            className={`${classes.btn} ${classes.btnRight} ${
              selectedIdx !== null && images && selectedIdx < images.length - 1
                ? classes.visible
                : ''
            }`}
            onClick={() => {
              setSelectedIdx((currentVal) => {
                if (
                  currentVal !== null &&
                  images &&
                  currentVal < images.length - 1
                ) {
                  return currentVal + 1
                }
                return currentVal
              })

              if (onMoveNext) {
                onMoveNext()
              }
            }}>
            <ChevronRightIcon />
          </div>
        </>
      )}
    </div>
  )
}

export default ImageGallery
