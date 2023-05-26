import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import LazyLoad from 'react-lazyload'
import LoadingIndicator from '../loading-indicator'
import defaultAvatarUrl from '../../assets/images/default-avatar.png'
import { fixAccessingImagesUsingToken } from '../../utils'

export const sizes = {
  TINY: 'tiny',
  SMALL: 'small',
  MEDIUM: 'medium'
}

const useStyles = makeStyles({
  container: {
    position: 'relative'
  },
  [sizes.TINY]: {
    width: '50px',
    height: '50px'
  },
  [sizes.SMALL]: {
    width: '100px',
    height: '100px'
  },
  [sizes.MEDIUM]: {
    width: '200px',
    height: '200px'
  },
  image: {
    width: '100%',
    height: '100%'
  }
})

export default ({
  url,
  username = '',
  size = sizes.MEDIUM,
  className = ''
}) => {
  const classes = useStyles()
  return (
    <div className={`${classes.container} ${classes[size]} ${className}`}>
      <LazyLoad placeholder={<LoadingIndicator />}>
        <img
          src={url ? fixAccessingImagesUsingToken(url) : defaultAvatarUrl}
          alt={`Avatar for ${username || 'a user'}`}
          className={classes.image}
        />
      </LazyLoad>
    </div>
  )
}
