import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import CloseIcon from '@material-ui/icons/Close'
import useNotice from '../../hooks/useNotice'
import Heading from '../heading'
import bannerImageUrl from './banner.webp'
import { FURALITY_URL } from '../../config'
import { trackAction } from '../../analytics'
import { mediaQueryForMobiles, mediaQueryForTablets } from '../../media-queries'

const useStyles = makeStyles({
  root: {
    position: 'relative',
    width: '100%',
    maxWidth: '800px',
    margin: '0 auto 0.5rem',
    [mediaQueryForMobiles]: {
      width: '98%',
      margin: '0 1%',
    },
  },
  inner: {
    outline: '2px solid rgba(255, 255, 255, 0.1)',
    outlineOffset: '-2px',
    padding: '4rem',
    textShadow: '1px 1px 1px #000',
    fontSize: '125%',
    '& a': {
      display: 'block',
      color: 'inherit',
    },
    // shine
    overflow: 'hidden',
    '&:before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: `linear-gradient(
                120deg,
                transparent,
                rgba(73, 152, 184, 0.25),
                transparent
            )`, // lightblue: rgba(73, 152, 184, 0.5)
      // purple rgba(38, 14, 105, 0.25),
      transition: 'all 650ms',
      zIndex: 0,
    },
    '&:hover:before': {
      left: '100%',
    },
    position: 'relative',
    transition: '200ms all',
    '&:hover': {
      transform: 'scale(1.05)',
    },
    [mediaQueryForTablets]: {
      padding: '2rem',
      fontSize: '100%',
    },
    [mediaQueryForMobiles]: {
      padding: '0.5rem 1rem 0.5rem 0.5rem',
      fontSize: '100%',
    },
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: `url(${bannerImageUrl}) no-repeat`,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    zIndex: -1,
    opacity: 0.5,
  },
  isHome: {
    marginTop: '2rem',
    [mediaQueryForMobiles]: {
      marginTop: '0.5rem',
    },
  },
  icon: {
    position: 'absolute',
    top: '2px',
    right: '2px',
    padding: '0.5rem',
    fontSize: '200%',
    zIndex: 100,
    cursor: 'pointer',
    transition: '100ms all',
    display: 'flex',
    alignItems: 'center',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
  },
  subtext: {
    position: 'relative',
    textAlign: 'right',
    marginTop: '2px',
    opacity: 0.5,
    fontSize: '65%',
    zIndex: -1,
  },
})

const FuralityBanner = () => {
  const [isHidden, hide] = useNotice('furality-sombra')
  const classes = useStyles()

  if (isHidden) {
    return null
  }

  return (
    <div className={classes.root}>
      <div className={classes.inner}>
        <div onClick={hide} className={classes.icon}>
          <CloseIcon />
        </div>
        <a
          href={FURALITY_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackAction('furality-sombra', 'click-banner')}>
          <div className={classes.background} />
          <Heading variant="h2" noTopMargin>
            Furality Sombra 2025 is on <strong>this weekend</strong>!
          </Heading>
          Click here for more info about the VRChat convention starting June 5th
          2025.
        </a>
      </div>
      <div className={classes.subtext}>
        VRCArena has no affiliation with Furality. We just love the convention!
      </div>
    </div>
  )
}

export default FuralityBanner
