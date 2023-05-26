import React, { useRef, useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import EditImageIcon from '../edit-image-icon'
import PedestalColumns from '../pedestal-columns'

const useStyles = makeStyles({
  videoWrapper: {
    position: 'relative'
  },
  video: {
    position: 'relative',
    zIndex: 100,
    opacity: 0,
    transition: 'opacity 500ms'
  },
  loaded: {
    opacity: 1
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
  },
  title: {
    fontSize: '300%'
  },
  controls: {
    margin: '1rem 0'
  },
  desc: {
    fontSize: '110%'
  },
  editorLeft: {
    border: '3px dashed rgba(255, 255, 255, 0.5)',
    marginRight: '0.5rem'
  },
  editorRight: {
    marginLeft: '0.5rem'
  }
})

export default ({
  videoUrl,
  fallbackImageUrl,
  children,
  showEditIcon,
  onEdit
}) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const videoRef = useRef()

  useEffect(() => {
    videoRef.current.addEventListener('loadeddata', () => {
      console.debug('Pedestal video has loaded -> hiding image')
      setIsVideoLoaded(true)
    })

    // fix a weird thing when it pauses randomly
    videoRef.current.addEventListener('pause', () => {
      console.debug('Pedestal video has paused -> playing')

      // on unmount this might happen
      if (videoRef.current) {
        videoRef.current.play()
      }
    })
  }, [])

  const classes = useStyles()
  return (
    <PedestalColumns
      leftCol={
        <div
          className={`${classes.videoWrapper} ${
            showEditIcon ? classes.editorLeft : ''
          }`}>
          <div className={classes.shadow} />
          <video
            ref={videoRef}
            width="100%"
            controls={false}
            autoPlay={true}
            loop={true}
            muted={true}
            className={`${classes.video} ${
              isVideoLoaded ? classes.loaded : ''
            }`}>
            <source src={videoUrl} type="video/webm" />
          </video>
          {isVideoLoaded === false && (
            <img
              src={fallbackImageUrl}
              width="100%"
              className={classes.video}
              alt="Fallback"
            />
          )}

          {showEditIcon && <EditImageIcon onClick={onEdit} />}
        </div>
      }
      rightCol={
        <div className={showEditIcon ? classes.editorRight : ''}>
          {children}
        </div>
      }
    />
  )
}
