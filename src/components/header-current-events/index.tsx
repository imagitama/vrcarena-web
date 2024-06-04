import React, { useCallback } from 'react'
import Link from '../../components/link'
import { makeStyles } from '@material-ui/core/styles'

import * as routes from '../../routes'
import useDataStore from '../../hooks/useDataStore'
import { client as supabase } from '../../supabase'
import { Event, PublicEvent, ViewNames } from '../../modules/events'
import { FeaturedStatus } from '../../modules/common'
import { mediaQueryForTabletsOrBelow } from '../../media-queries'
import { getFriendlyDate } from '../../utils/dates'

const useStyles = makeStyles({
  root: {
    position: 'relative',
    animation: '3s ease infinite alternate $pulseLogo',
    '&:hover': {
      animation: '100ms $hoverOverLogo forwards',
    },
  },
  banner: {
    height: '75px',
    transition: '100ms all',
    display: 'block',
    padding: '0.5rem 0 0 0.75rem',
    '& a': {
      color: 'inherit',
      textShadow: '1px 1px 1px #000',
      display: 'flex',
      alignItems: 'center',
      fontSize: '50%',
    },
    '& img': {
      height: '100%',
    },
    [mediaQueryForTabletsOrBelow]: {
      height: '50px',
      padding: 0,
    },
  },
  '@keyframes hoverOverLogo': {
    '0%': {
      transform: 'scale(1)',
    },
    '100%': {
      transform: 'scale(1.1)',
    },
  },
  '@keyframes pulseLogo': {
    '0%': {
      transform: 'scale(1)',
    },
    '75%': {
      transform: 'scale(1)',
    },
    '100%': {
      transform: 'scale(1.05)',
    },
  },
  placeholder: {
    textAlign: 'center',
    opacity: '0.5',
    fontStyle: 'italic',
    fontSize: '75%',
    padding: '1rem',
    display: 'block',
    color: 'inherit',
  },
  chip: {
    position: 'absolute',
    top: 0,
    right: 0,
    borderRadius: '0.25rem',
    zIndex: 100,
    background: 'rgb(150, 100, 0)',
    color: '#FFF',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    fontSize: '75%',
    padding: '0 0.2rem',
    transform: 'translate(10%, -10%)',
  },
  onNow: {
    background: 'red',
  },
})

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000

const HeaderCurrentEvents = () => {
  const getQuery = useCallback(
    () =>
      supabase
        .from<PublicEvent>(ViewNames.GetPublicEvents)
        .select('*')
        .eq('featuredstatus', FeaturedStatus.Featured)
        .gt('endsat', new Date().toISOString()),
    []
  )
  const [isLoading, lastErrorCode, events] = useDataStore<Event[]>(
    getQuery,
    'current-events'
  )
  const classes = useStyles()

  if (isLoading || !events) {
    return null
  }

  if (lastErrorCode !== null) {
    return <>Failed to load events</>
  }

  if (!events.length) {
    return null
  }

  const { id, name, bannerurl, slug, startsat, endsat } = events[0]

  if (!bannerurl) {
    return <>No banner URL configured</>
  }

  const isCurrentlyOn =
    new Date(startsat).getTime() <= new Date().getTime() &&
    new Date().getTime() <= new Date(endsat).getTime()

  const isUnderOneWeek =
    isCurrentlyOn ||
    new Date(startsat).getTime() - new Date().getTime() <= ONE_WEEK_MS

  return (
    <Link
      to={routes.viewEventWithVar.replace(':eventId', slug || id)}
      className={classes.root}>
      {isCurrentlyOn || isUnderOneWeek ? (
        <div
          className={`${classes.chip} ${isCurrentlyOn ? classes.onNow : ''}`}>
          {isCurrentlyOn ? 'On Right Now!' : getFriendlyDate(startsat)}
        </div>
      ) : null}
      <img
        src={bannerurl}
        alt={`Banner for ${name}`}
        className={classes.banner}
      />
    </Link>
  )
}

export default HeaderCurrentEvents
