import React, { useCallback } from 'react'
import Link from '../../components/link'
import { makeStyles } from '@material-ui/core/styles'
import EventIcon from '@material-ui/icons/Event'

import * as routes from '../../routes'
import useDataStore from '../../hooks/useDataStore'
import { client as supabase } from '../../supabase'
import { Event, FullEvent, PublicEvent, ViewNames } from '../../modules/events'
import { FeaturedStatus } from '../../modules/common'
import { mediaQueryForTabletsOrBelow } from '../../media-queries'

const useStyles = makeStyles({
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
    animation: '3s ease infinite alternate $pulseLogo',
    '&:hover': {
      animation: '100ms $hoverOverLogo forwards',
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
})

export default () => {
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

  const { id, name, bannerurl, slug } = events[0]

  if (!bannerurl) {
    return <>No banner URL configured</>
  }

  return (
    <Link to={routes.viewEventWithVar.replace(':eventId', slug || id)}>
      <img
        src={bannerurl}
        alt={`Banner for ${name}`}
        className={classes.banner}
      />
    </Link>
  )
}
