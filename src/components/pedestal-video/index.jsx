import React, { useRef, useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles({
  root: {
    position: 'relative',
    width: '100%',
    aspectRatio: '1/1'
  },
  slideIn: {
    maxHeight: 0,
    transition: 'all 1s'
  },
  fallbackImage: {
    width: '100%',
    height: '100%',
    position: 'relative',
    zIndex: 100
  },
  video: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    zIndex: 100,
    transition: 'opacity 500ms'
  },
  loaded: {
    opacity: 1
  },
  fallbackImageDone: {
    opacity: 0
  },
  shadowWrapper: {
    position: 'absolute',
    top: '50%',
    left: 0,
    transform: 'translateY(-25%)'
  },
  shadow: {
    position: 'absolute',
    bottom: '0',
    left: '0',
    width: '100%',
    height: '20%',
    background:
      'radial-gradient(ellipse, rgba(0,0,0,1) 0%, rgba(255,255,255,0) 50%)'
  }
})

const INITIAL_STATES = {
  play: 'play',
  paused: 'paused'
}

export default ({
  videoUrl,
  fallbackImageUrl = '',
  preloadTime = null,
  onTimeUpdate = null,
  noShadow = false
}) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const videoRef = useRef()

  useEffect(() => {
    if (!videoRef.current) return

    videoRef.current.addEventListener('loadedmetadata', () => {
      if (videoRef.current && preloadTime) {
        videoRef.current.currentTime = preloadTime
      }
    })

    videoRef.current.addEventListener('play', () => {
      console.debug('Pedestal video has loaded -> hiding image')

      if (videoRef.current) {
        setIsVideoLoaded(true)
      }
    })

    if (onTimeUpdate) {
      videoRef.current.addEventListener('timeupdate', e => {
        if (videoRef.current) {
          onTimeUpdate(e.target.currentTime)
        }
      })
    }
  }, [])

  const classes = useStyles()

  return (
    <div className={classes.root}>
      {!noShadow && <div className={classes.shadow} />}
      <video
        ref={videoRef}
        controls={false}
        autoPlay={true}
        loop={true}
        muted={true}
        className={`${classes.video} ${isVideoLoaded ? classes.loaded : ''}`}>
        <source src={videoUrl} type="video/webm" />
      </video>
      <img
        src={fallbackImageUrl}
        width="100%"
        className={`${classes.fallbackImage} ${
          isVideoLoaded ? classes.fallbackImageDone : ''
        }`}
        alt="Fallback"
      />
    </div>
  )
}
