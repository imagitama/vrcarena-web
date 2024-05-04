import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import LazyLoad from 'react-lazyload'
import LoadingIndicator from '../loading-indicator'
import DefaultAvatar from '../default-avatar'
import { ReactComponent as ChristmasHat } from '../../assets/images/christmas-hat.svg'
import { fixAccessingImagesUsingToken, getIsChristmasTime } from '../../utils'

export const sizes = {
  TINY: 'tiny',
  SMALL: 'small',
  MEDIUM: 'medium',
}

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'relative',
    '&:hover $hat': {
      top: '-5%',
    },
  },
  imageWrapper: {
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
  },
  [sizes.TINY]: {
    width: '50px',
    height: '50px',
  },
  [sizes.SMALL]: {
    width: '100px',
    height: '100px',
  },
  [sizes.MEDIUM]: {
    width: '200px',
    height: '200px',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  hat: {
    width: '100%',
    height: 'auto',
    position: 'absolute',
    top: 0,
    transition: '100ms all',
    left: '50%',
    transform: 'translate(-32%, -75%) scale(1.75, 1) rotate(-5deg)',
  },
}))

const Avatar = ({
  url = undefined,
  username = undefined,
  size = sizes.MEDIUM,
  className = undefined,
  lazy = true,
  noHat = false,
}: {
  url?: string
  username?: string
  size?: string
  className?: string
  lazy?: boolean
  noHat?: boolean
}) => {
  const classes = useStyles()

  const elem = (
    <>
      {getIsChristmasTime() && noHat !== true && (
        <ChristmasHat className={classes.hat} />
      )}
      <div className={classes.imageWrapper}>
        {url ? (
          <img
            src={fixAccessingImagesUsingToken(url)}
            alt={`Avatar for ${username || 'a user'}`}
            className={classes.image}
          />
        ) : (
          <DefaultAvatar stringForDecision={username} />
        )}
      </div>
    </>
  )

  return (
    <div className={`${classes.root} ${classes[size]} ${className}`}>
      {lazy ? (
        <LazyLoad placeholder={<LoadingIndicator />} once>
          {elem}
        </LazyLoad>
      ) : (
        elem
      )}
    </div>
  )
}

export default Avatar
