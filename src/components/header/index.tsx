import React from 'react'
import { useDispatch } from 'react-redux'
import { makeStyles } from '@mui/styles'
import { useMediaQuery } from 'react-responsive'
import MenuIcon from '@mui/icons-material/Menu'
import GitHubIcon from '@mui/icons-material/GitHub'

import * as routes from '@/routes'
import { openMenu } from '@/modules/app'
import { ReactComponent as Logo } from '@/assets/images/logo.svg'
import { ReactComponent as DiscordIcon } from '@/assets/images/icons/discord.svg'
import { ReactComponent as PatreonIcon } from '@/assets/images/icons/patreon.svg'
import {
  queryForMobiles,
  mediaQueryForMobiles,
  mediaQueryForDesktopsOnly,
  mediaQueryForTabletsOrBelow,
} from '@/media-queries'
import { trackAction } from '@/analytics'
import {
  DISCORD_URL,
  GITHUB_REPO_URL,
  PATREON_BECOME_PATRON_URL,
} from '@/config'
import { colors } from '@/brand'

import Link from '@/components/link'
import MobileMenu from '@/components/mobile-menu'
import AccountMenu from '@/components/account-menu'
import Searchbar from '@/components/searchbar'
import DesktopMenu from '@/components/desktop-menu'
import VrchatGroupButton from '../vrchat-group-button'
import store from '@/store'

// when the navigation starts obstructing the logo
const mediaQueryForMenuLogoCollision = '@media (max-width: 1280px)'

const useStyles = makeStyles({
  root: {
    display: 'flex',
    position: 'relative',
    padding: '1rem',
    background: `linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(110, 74, 158, 0.2) 100%)`,
    [mediaQueryForMobiles]: {
      padding: '0.5rem',
      flexDirection: 'column',
    },
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
    '& a': {
      height: '100%',
      display: 'flex',
      alignItems: 'center',
    },
  },
  socialIcons: {
    marginLeft: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    '& a': {
      display: 'flex',
      alignItems: 'center',
      padding: '0 0.25rem',
      opacity: '0.75',
      transition: 'opacity 200ms',
      '&:hover': {
        opacity: 1,
      },
    },
    '& .twitterIconLink': {
      paddingRight: '0.25rem',
    },
    '& svg': {
      width: 'auto', // fix patreon icon
      height: '2em',
    },
    '& .twitterIcon': {
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
      animation: '$wiggle 500ms',
    },
    [mediaQueryForMenuLogoCollision]: {
      height: '50px',
    },
    [mediaQueryForMobiles]: {
      height: '50px',
    },
  },
  '@keyframes wiggle': {
    '0%': { transform: 'rotate(0deg)' },
    '15%': { transform: 'rotate(6deg)' },
    '30%': { transform: 'rotate(-5deg)' },
    '45%': { transform: 'rotate(4deg)' },
    '60%': { transform: 'rotate(-3deg)' },
    '75%': { transform: 'rotate(2deg)' },
    '90%': { transform: 'rotate(-1deg)' },
    '100%': { transform: 'rotate(0deg)' },
  },
  menuToggleButton: {
    width: '3rem',
    height: '3rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    cursor: 'pointer',
    position: 'absolute',
    top: 0,
    right: 0,
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },

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
    [mediaQueryForMobiles]: {
      display: 'flex',
    },
  },
  searchbarWrapper: {
    margin: '0.25rem auto -0.5rem',
    padding: '0 1rem',
    [mediaQueryForMobiles]: {
      width: '100%',
      margin: '0.5rem auto 0',
      padding: 0,
    },
  },
  vrchatGroupButton: {
    fontSize: '0.5rem',
    margin: '0.5rem 0 0 0.5rem',
    [mediaQueryForMobiles]: { margin: 0 },
    opacity: '0.75',
    transition: 'opacity 200ms',
    '&:hover': {
      opacity: 1,
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
      <a
        href={GITHUB_REPO_URL}
        title="Visit our GitHub repo"
        onClick={() => trackAction('Header', 'Click visit GitHub icon')}>
        <GitHubIcon />
      </a>
    </div>
  )
}

export default () => {
  const classes = useStyles()
  const dispatch = useDispatch<typeof store.dispatch>()
  const isMobile = useMediaQuery({ query: queryForMobiles })
  const dispatchOpenMenu = () => dispatch(openMenu())

  const onToggleMobileMenuClick = () => {
    dispatchOpenMenu()
    trackAction('Header', 'Click open mobile menu button')
  }

  return (
    <header className={classes.root}>
      <div className={classes.logoWrapper}>
        <Link
          to={routes.home}
          title="Go to the homepage of The VRCArena Project">
          <Logo className={classes.logo} />
        </Link>
        <div className={classes.socialMediaRows}>
          <div>
            <SocialMediaIcons />
          </div>
          <div className={classes.vrchatGroupButton}>
            <VrchatGroupButton />
          </div>
        </div>
      </div>

      <div className={classes.searchbarWrapper}>
        <Searchbar />
        {!isMobile ? <DesktopMenu /> : null}
      </div>

      <div>
        {!isMobile && <AccountMenu />}
        {isMobile && (
          <div
            className={classes.menuToggleButton}
            onClick={onToggleMobileMenuClick}>
            <MenuIcon className={classes.menuToggleIcon} />
            <span hidden>Menu</span>
          </div>
        )}
      </div>

      {isMobile ? <MobileMenu /> : null}
    </header>
  )
}
