import React from 'react'
import Link from '../../components/link'
import { useDispatch, useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import { useMediaQuery } from 'react-responsive'
import MenuIcon from '@material-ui/icons/Menu'

import * as routes from '../../routes'
import { openMenu } from '../../modules/app'
import { ReactComponent as Logo } from '../../assets/images/logo.svg'
import { ReactComponent as DiscordIcon } from '../../assets/images/icons/discord.svg'
import { ReactComponent as PatreonIcon } from '../../assets/images/icons/patreon.svg'
import {
  queryForMobiles,
  mediaQueryForMobiles,
  mediaQueryForDesktopsOnly,
  mediaQueryForTabletsOrBelow,
} from '../../media-queries'
import { trackAction } from '../../analytics'
import { DISCORD_URL, PATREON_BECOME_PATRON_URL } from '../../config'

import MobileMenu from '../mobile-menu'
import AccountMenu from '../account-menu'
import { colors } from '../../brand'
import HeaderCurrentEvents from '../header-current-events'

// when the navigation starts obstructing the logo
const mediaQueryForMenuLogoCollision = '@media (max-width: 1280px)'

const useStyles = makeStyles({
  root: {
    display: 'flex',
    position: 'relative',
    padding: '1rem 1rem 0',
    height: '125px',
    [mediaQueryForTabletsOrBelow]: {
      height: '160px',
    },
    [mediaQueryForMobiles]: {
      height: '120px',
      padding: '0.5rem 0.5rem 0',
    },
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: -5,
    background: `linear-gradient(180deg, ${colors.BrandVeryDark}, rgba(0,0,0,0))`,
    transition: 'all 1000ms',
  },
  withBanner: {
    opacity: 0,
  },
  cols: {
    display: 'flex',
    [mediaQueryForMobiles]: {
      flexWrap: 'wrap',
    },
  },
  leftCol: {
    flexShrink: 1,
    marginRight: '2%',
  },
  rightCol: {
    width: '100%',
  },
  floatingMenu: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: '1rem',
  },
  searchBar: {
    width: '100%',
  },
  searchBarInner: {
    width: '50%',
    margin: '0.5rem auto 0',
    [mediaQueryForMobiles]: {
      width: '100%',
      marginBottom: '0.5rem',
    },
  },
  desktopMenu: {
    width: '100%',
  },
  logoWrapper: {
    display: 'flex',
    alignItems: 'start',
    top: 0,
    left: 0,
    [mediaQueryForMobiles]: {
      position: 'relative',
      padding: 0,
    },
  },
  socialIcons: {
    marginLeft: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    '& a': {
      display: 'flex',
      alignItems: 'center',
      padding: '0 0.5rem',
      opacity: '0.75',
      transition: 'all 100ms',
      '&:hover': {
        opacity: 1,
      },
    },
    '& $twitterIconLink': {
      paddingRight: '0.25rem',
    },
    '& svg': {
      width: 'auto', // fix patreon icon
      height: '2em',
    },
    '& $twitterIcon': {
      height: '1.5em',
    },
    '& path': {
      fill: '#FFF',
    },
  },
  twitterIconLink: {},
  twitterIcon: {},
  logo: {
    '& path': {
      fill: colors.BrandLight,
    },
    height: '75px',
    width: 'auto',
    opacity: '0.75',
    transition: 'all 100ms',
    '&:hover': {
      opacity: 1,
    },
    [mediaQueryForMenuLogoCollision]: {
      height: '50px',
    },
    [mediaQueryForMobiles]: {
      height: '50px',
    },
  },
  menuToggleButton: {
    position: 'absolute',
    top: 0,
    right: 0,

    [mediaQueryForDesktopsOnly]: {
      display: 'none',
    },
  },
  menuToggleIcon: {
    width: '4rem',
    height: '3rem',
    fill: '#FFF',
  },
  invisible: {
    visibility: 'hidden',
  },
  homepage: {
    top: '100%',
  },
  socialMediaRows: {
    [mediaQueryForTabletsOrBelow]: {
      display: 'flex',
    },
  },
})

const SocialMediaIcons = () => {
  const classes = useStyles()
  return (
    <div className={classes.socialIcons}>
      <a
        href={DISCORD_URL}
        title="Visit our Discord"
        onClick={() => trackAction('Header', 'Click visit Discord icon')}>
        <DiscordIcon />
      </a>
      <a
        href={PATREON_BECOME_PATRON_URL}
        title="Visit our Patreon"
        onClick={() => trackAction('Header', 'Click visit Patreon icon')}>
        <PatreonIcon />
      </a>
    </div>
  )
}

export default () => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const isMobile = useMediaQuery({ query: queryForMobiles })
  const dispatchOpenMenu = () => dispatch(openMenu())
  // @ts-ignore
  const bannerUrl = useSelector(({ app }) => app.bannerUrl)

  const onToggleMobileMenuClick = () => {
    dispatchOpenMenu()
    trackAction('Header', 'Click open mobile menu button')
  }

  return (
    <header className={classes.root}>
      <div className={classes.logoWrapper}>
        <Link to={routes.home} title="Go to the homepage of VRCArena">
          <Logo className={classes.logo} />
        </Link>
        <div className={classes.socialMediaRows}>
          <div>
            <SocialMediaIcons />
          </div>
          <div>
            <HeaderCurrentEvents />
          </div>
        </div>
      </div>

      <div className={classes.floatingMenu}>
        {!isMobile && <AccountMenu />}
        {isMobile && (
          <Button
            className={classes.menuToggleButton}
            onClick={onToggleMobileMenuClick}>
            <MenuIcon className={classes.menuToggleIcon} />
            <span hidden>Menu</span>
          </Button>
        )}
      </div>

      {isMobile && <MobileMenu />}

      <div
        className={`${classes.background} ${
          bannerUrl ? classes.withBanner : ''
        }`}
      />
    </header>
  )
}
