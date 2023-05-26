import React, { useState, useEffect } from 'react'
import Lightbox from 'react-image-lightbox-custom'
import { makeStyles } from '@material-ui/core/styles'
import 'react-image-lightbox-custom/style.css'
import YouTubeIcon from '@material-ui/icons/YouTube'
import {
  getImageUrlFromYouTubeUrl,
  isUrl,
  isUrlAYoutubeVideo
} from '../../utils'
import YouTubePlayer from '../youtube-player'

const useStyles = makeStyles({
  root: {},
  // lightbox library has a bug where it fills the viewport with a child which doesn't bubble up the click events
  imageWrapper: {
    '& .ril__inner': {
      position: 'static',
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      justifyItems: 'center'
    },
    '& .ril__image': {
      position: 'static'
    }
  },
  thumbs: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    '& picture': {
      position: 'relative',
      width: '33.3%',
      maxWidth: '400px',
      paddingRight: '0.5rem',
      cursor: 'pointer',
      '& img': {
        width: '100%'
      },
      '&:last-child img': {
        paddingRight: 0
      },
      '& svg': {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        color: 'rgb(255, 0, 0)',
        fontSize: '10rem',
        transition: 'all 100ms'
      },
      '&:hover svg': {
        color: 'rgb(255, 100, 100)'
      }
    }
  },
  nowrap: {
    flexWrap: 'nowrap'
  },
  customContent: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    justifyItems: 'center'
  },
  youtubeIcon: {}
})

function getSrcForIndex(index: number, urls: string[]) {
  // return empty string to ImageGallery uses "items"
  if (!urls || !urls.length) {
    return ''
  }

  const urlOrUrls = urls[index]
  return urlOrUrls
}

export const Sizes = {
  SMALL: 'small',
  LARGE: 'large'
}

export default ({
  urls = [],
  renderer = undefined,
  thumbnailUrls = undefined,
  onOpen = undefined,
  onMoveNext = undefined,
  onMovePrev = undefined,
  wrap = true,
  className = '',
  isStatic = false,
  minHeight = undefined
}: {
  urls?: string[]
  renderer?: React.ComponentType<{ url: string; index: number }>
  thumbnailUrls?: (string | React.ReactNode)[]
  onOpen?: () => void | Promise<void>
  onMoveNext?: () => void | Promise<void>
  onMovePrev?: () => void | Promise<void>
  wrap?: boolean
  className?: string
  isStatic?: boolean
  minHeight?: number
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [activePhotoIdx, setActivePhotoIdx] = useState(0)
  const classes = useStyles()
  const [height, setHeight] = useState<number | undefined>(minHeight)

  if (!thumbnailUrls) {
    thumbnailUrls = urls
  }

  useEffect(() => {
    if (!minHeight) {
      return
    }
    setHeight(minHeight)
  }, [minHeight])

  function onThumbnailClick(idx: number) {
    setActivePhotoIdx(idx)
    setIsOpen(true)
    if (onOpen) {
      onOpen()
    }
  }

  return (
    <div
      className={`${classes.root} ${className || ''}`}
      style={{
        // this is to prevent the gallery shrinking to 0px when we give it new URLs (such as when shimmer goes away)
        // probably broken if you navigate between assets XD
        height
      }}>
      {isOpen && (
        <Lightbox
          wrapperClassName={classes.imageWrapper}
          mainSrc={getSrcForIndex(activePhotoIdx, urls)}
          nextSrc={getSrcForIndex((activePhotoIdx + 1) % urls.length, urls)}
          prevSrc={getSrcForIndex(
            (activePhotoIdx + urls.length - 1) % urls.length,
            urls
          )}
          // @ts-ignore
          mainCustomContent={
            isUrlAYoutubeVideo(urls[activePhotoIdx]) ? (
              <div className={classes.customContent}>
                <YouTubePlayer url={urls[activePhotoIdx]} />
              </div>
            ) : renderer ? (
              <div className={classes.customContent}>
                {React.createElement(renderer, {
                  url: urls[activePhotoIdx],
                  index: activePhotoIdx
                })}
              </div>
            ) : (
              undefined
            )
          }
          // need these or it renders errors (note: next/back arrows always visible)
          nextCustomContent={<></>}
          prevCustomContent={<></>}
          onCloseRequest={() => {
            console.log('onCloseRequest')
            setIsOpen(false)
          }}
          onMovePrevRequest={() => {
            setActivePhotoIdx((activePhotoIdx + urls.length - 1) % urls.length)
            if (onMovePrev) {
              onMovePrev()
            }
          }}
          onMoveNextRequest={() => {
            setActivePhotoIdx((activePhotoIdx + 1) % urls.length)
            if (onMoveNext) {
              onMoveNext()
            }
          }}
          clickOutsideToClose
        />
      )}
      <div
        className={`${classes.thumbs} ${wrap === false ? classes.nowrap : ''}`}>
        {thumbnailUrls.map(
          (contents: string | React.ReactNode, idx: number) => {
            const isContentsUrl = isUrl(contents)
            const youtubImageUrl = isContentsUrl
              ? getImageUrlFromYouTubeUrl(contents)
              : false
            return (
              <picture
                key={idx}
                onClick={() => (!isStatic ? onThumbnailClick(idx) : null)}>
                {isContentsUrl ? (
                  <>
                    <img
                      src={youtubImageUrl || contents}
                      alt={`Thumbnail ${idx}`}
                      ref={imageElement => {
                        if (!imageElement) {
                          return
                        }
                        imageElement.onload = () => setHeight(undefined)
                      }}
                    />
                    {youtubImageUrl ? (
                      <YouTubeIcon className={classes.youtubeIcon} />
                    ) : null}
                  </>
                ) : React.isValidElement(contents) ? (
                  React.cloneElement(contents)
                ) : null}
              </picture>
            )
          }
        )}
      </div>
    </div>
  )
}
