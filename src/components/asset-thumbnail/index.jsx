import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

import { THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT } from '../../config'
import defaultThumbnailUrl from '../../assets/images/default-thumbnail.webp'

const useStyles = makeStyles({
  root: {
    perspective: '1000px',
    '& img': {
      width: '100%',
      height: '100%'
    }
  },
  spin: {
    animation: '20s $spinThumbnail infinite linear',
    transition: 'all 100ms'
  },
  pauseOnHover: {
    '&:hover': {
      animation: 'none'
    }
  },
  '@keyframes spinThumbnail': {
    from: {
      transform: 'rotateY(0deg)'
    },
    to: {
      transform: 'rotateY(360deg)'
    }
  },
  full: {
    width: '300px',
    height: '300px'
  },
  small: {
    width: '200px',
    height: '200px'
  },
  tiny: {
    width: '100px',
    height: '100px'
  }
})

export default ({
  url,
  className = '',
  spin = false,
  pauseOnHover = true,
  size = 'full'
}) => {
  const classes = useStyles()
  return (
    <div className={`${classes.root} ${classes[size]}`}>
      <img
        src={url || defaultThumbnailUrl}
        width={THUMBNAIL_WIDTH}
        height={THUMBNAIL_HEIGHT}
        alt="Thumbnail for asset"
        className={`${className} ${spin ? classes.spin : ''} ${
          pauseOnHover ? classes.pauseOnHover : ''
        }`}
      />
    </div>
  )
}
